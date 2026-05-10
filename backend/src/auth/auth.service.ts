import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { ILike, IsNull, MoreThan, Repository } from 'typeorm';
import {
  AccountStatus,
  AuthRole,
  DEFAULT_ACCESS_TTL,
  DEFAULT_REFRESH_TTL,
  DEFAULT_REFRESH_TTL_LONG,
  REGISTER_ROLES,
  UserRole,
} from './auth.constants';
import type { AuthRestaurantContext, JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { RegisterDto } from './dto/register.dto';
import { CustomerProfile } from '../entities/customer-profile.entity';
import { OwnerProfile } from '../entities/owner-profile.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { UserAccount } from '../entities/user-account.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userRepo: Repository<UserAccount>,
    @InjectRepository(CustomerProfile)
    private readonly customerRepo: Repository<CustomerProfile>,
    @InjectRepository(OwnerProfile)
    private readonly ownerRepo: Repository<OwnerProfile>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    if (!REGISTER_ROLES.includes(dto.role)) {
      throw new BadRequestException('Role is not allowed for registration.');
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({
      where: { email: ILike(email) },
    });

    if (existing) {
      throw new BadRequestException('Email is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const account = this.userRepo.create({
      email,
      passwordHash,
      role: dto.role,
      status: AccountStatus.Active,
    });

    const savedAccount = await this.userRepo.save(account);

    let profile: any = null;
    let restaurantContext: AuthRestaurantContext | null = null;
    if (dto.role === UserRole.User) {
      const p = this.customerRepo.create({
        accountId: savedAccount.accountId,
        fullName: dto.fullName,
        purpose: dto.purpose,
        displayName: dto.displayName,
        dob: dto.dob ? this.normalizeDate(dto.dob) : undefined,
        gender: dto.gender ? this.normalizeGender(dto.gender) : undefined,
        nationality: dto.nationality,
      });
      profile = await this.customerRepo.save(p);
    }

    if (dto.role === UserRole.Owner) {
      const p = this.ownerRepo.create({
        accountId: savedAccount.accountId,
        fullName: dto.representativeName ?? dto.fullName,
        phone: dto.phone,
        businessName: dto.storeName,
      });
      profile = await this.ownerRepo.save(p);

      // Create initial restaurant entry for owners
      const restaurant = this.restaurantRepo.create({
        ownerAccountId: savedAccount.accountId,
        nameVn: dto.storeName ?? dto.fullName,
        nameJp: dto.storeNameJp ?? dto.storeName ?? dto.fullName,
        address: dto.address ?? 'TBD',
        phone: dto.phone ?? '',
        openingHours: dto.openingHours ?? 'TBD',
        issuesVat: dto.issuesVat ?? false,
      });
      const savedRestaurant = await this.restaurantRepo.save(restaurant);
      restaurantContext = this.toRestaurantContext(savedRestaurant);
    }

    const tokens = await this.issueTokens(savedAccount);

    return {
      account: this.sanitizeAccount(savedAccount),
      profile,
      restaurant: restaurantContext,
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const account = await this.userRepo.findOne({
      where: { email: ILike(email) },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isMatch = await bcrypt.compare(dto.password, account.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (
      account.status === AccountStatus.Banned ||
      account.status === AccountStatus.Disabled
    ) {
      throw new ForbiddenException('Account is not active.');
    }

    const tokens = await this.issueTokens(account, dto.rememberMe);
    const restaurantContext = await this.getRestaurantContext(account);

    return {
      account: this.sanitizeAccount(account),
      restaurant: restaurantContext,
      tokens,
    };
  }

  async refresh(refreshToken: string) {
    const refreshSecret = this.getRefreshSecret();
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid.');
    }

    if (payload.role === AuthRole.Guest) {
      const tokens = await this.issueTokensForPayload(payload);

      return {
        account: {
          accountId: 0,
          email: 'guest',
          role: AuthRole.Guest,
          status: AccountStatus.Active,
        },
        restaurant: null,
        tokens,
      };
    }

    const account = await this.userRepo.findOne({
      where: { accountId: payload.sub },
    });

    if (!account) {
      throw new UnauthorizedException('Account not found.');
    }

    if (
      account.status === AccountStatus.Banned ||
      account.status === AccountStatus.Disabled
    ) {
      throw new ForbiddenException('Account is not active.');
    }

    const tokens = await this.issueTokens(account);
    const restaurantContext = await this.getRestaurantContext(account);

    return {
      account: this.sanitizeAccount(account),
      restaurant: restaurantContext,
      tokens,
    };
  }

  async getMe(accountId: number) {
    if (accountId === 0) {
      return {
        account: {
          accountId: 0,
          email: 'guest',
          role: AuthRole.Guest,
          status: AccountStatus.Active,
        },
        profile: null,
        restaurant: null,
        profileCompleted: false,
        guest: true,
      };
    }

    const account = await this.userRepo.findOne({
      where: { accountId },
      relations: {
        customerProfile: true,
        ownerProfile: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    const profileCompleted = this.isProfileCompleted(account);
    const restaurantContext = await this.getRestaurantContext(account);

    return {
      account: this.sanitizeAccount(account),
      profile: account.customerProfile ?? account.ownerProfile ?? null,
      restaurant: restaurantContext,
      profileCompleted,
    };
  }


  async guestLogin() {
    const payload: JwtPayload = {
      sub: 0,
      email: 'guest',
      role: AuthRole.Guest,
    };

    const tokens = await this.issueTokensForPayload(payload);

    return {
      account: {
        accountId: 0,
        email: 'guest',
        role: AuthRole.Guest,
        status: AccountStatus.Active,
      },
      restaurant: null,
      tokens,
      guest: true,
    };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const email = dto.email.trim().toLowerCase();
    const account = await this.userRepo.findOne({
      where: { email: ILike(email) },
    });

    if (!account) {
      return {
        message: 'If the account exists, a temporary password has been sent.',
      };
    }

    // Generate a secure random temporary password (8 characters)
    const tempPassword = randomBytes(4).toString('hex');
    account.passwordHash = await bcrypt.hash(tempPassword, 10);
    await this.userRepo.save(account);

    // Detect preferred language
    const lang: 'vi' | 'ja' = dto.lang ?? (email.endsWith('.jp') ? 'ja' : 'vi');

    // Send the email
    await this.mailService.sendTemporaryPassword({
      to: account.email,
      tempPassword,
      lang,
    });

    const response: { message: string; tempPassword?: string } = {
      message: 'If the account exists, a temporary password has been sent.',
    };

    // Expose in response only in development
    if (this.configService.get<string>('NODE_ENV') === 'development') {
      response.tempPassword = tempPassword;
    }

    return response;
  }

  private async issueTokens(account: UserAccount, rememberMe?: boolean) {
    const payload: JwtPayload = {
      sub: account.accountId,
      email: account.email,
      role: account.role as unknown as AuthRole,
    };

    return this.issueTokensForPayload(payload, rememberMe);
  }

  private async issueTokensForPayload(
    payload: JwtPayload,
    rememberMe?: boolean,
  ) {
    const accessSecret = this.getAccessSecret();
    const refreshSecret = this.getRefreshSecret();

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: this.getAccessTtl(),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: this.getRefreshTtl(rememberMe),
    });

    return { accessToken, refreshToken };
  }

  private sanitizeAccount(account: UserAccount) {
    return {
      accountId: account.accountId,
      email: account.email,
      role: account.role,
      status: account.status,
    };
  }

  private async getRestaurantContext(
    account: UserAccount,
  ): Promise<AuthRestaurantContext | null> {
    if (account.role !== UserRole.Owner) {
      return null;
    }

    const restaurant = await this.restaurantRepo.findOne({
      where: { ownerAccountId: account.accountId },
      order: { restaurantId: 'ASC' },
    });

    return restaurant ? this.toRestaurantContext(restaurant) : null;
  }

  private toRestaurantContext(restaurant: Restaurant): AuthRestaurantContext {
    return {
      restaurantId: restaurant.restaurantId,
      ownerAccountId: restaurant.ownerAccountId,
      nameVn: restaurant.nameVn,
      nameJp: restaurant.nameJp,
      status: restaurant.status,
    };
  }

  private isProfileCompleted(account: UserAccount) {
    if (account.role === UserRole.User) {
      const profile = account.customerProfile;
      return Boolean(
        profile?.displayName &&
          profile?.dob &&
          profile?.gender &&
          profile?.nationality,
      );
    }

    if (account.role === UserRole.Owner) {
      const profile = account.ownerProfile;
      return Boolean(profile?.businessName && profile?.phone && profile?.fullName);
    }

    return false;
  }

  private normalizeDate(value: string) {
    const trimmed = value.trim();
    const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);

    if (isoMatch) {
      return trimmed;
    }

    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);

    if (!match) {
      throw new BadRequestException('DOB must be YYYY-MM-DD or MM/DD/YYYY.');
    }

    const month = match[1].padStart(2, '0');
    const day = match[2].padStart(2, '0');
    const year = match[3];

    return `${year}-${month}-${day}`;
  }

  private normalizeGender(value: string) {
    const normalized = value.trim().toLowerCase();

    if (['male', 'm', 'nam'].includes(normalized)) {
      return 'Male';
    }

    if (['female', 'f', 'nu'].includes(normalized)) {
      return 'Female';
    }

    return 'Other';
  }

  private getAccessSecret() {
    return (
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      this.configService.get<string>('JWT_SECRET') ??
      'dev_access_secret'
    );
  }

  private getRefreshSecret() {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.configService.get<string>('JWT_SECRET') ??
      'dev_refresh_secret'
    );
  }

  private getAccessTtl() {
    return (this.configService.get<string>('JWT_ACCESS_TTL') ??
      DEFAULT_ACCESS_TTL) as JwtSignOptions['expiresIn'];
  }

  private getRefreshTtlBase() {
    return (this.configService.get<string>('JWT_REFRESH_TTL') ??
      DEFAULT_REFRESH_TTL) as JwtSignOptions['expiresIn'];
  }

  private getRefreshTtlLong() {
    return (this.configService.get<string>('JWT_REFRESH_TTL_LONG') ??
      DEFAULT_REFRESH_TTL_LONG) as JwtSignOptions['expiresIn'];
  }

  private getRefreshTtl(rememberMe?: boolean) {
    if (rememberMe) {
      return this.getRefreshTtlLong();
    }

    return this.getRefreshTtlBase();
  }
}
