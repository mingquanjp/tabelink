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
  PASSWORD_RESET_TTL_MINUTES,
  REGISTER_ROLES,
  UserRole,
} from './auth.constants';
import { JwtPayload } from './auth.types';
import { DinerProfileDto } from './dto/diner-profile.dto';
import { LoginDto } from './dto/login.dto';
import { MerchantProfileDto } from './dto/merchant-profile.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CustomerProfile } from '../entities/customer-profile.entity';
import { OwnerProfile } from '../entities/owner-profile.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
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
    @InjectRepository(PasswordResetToken)
    private readonly resetRepo: Repository<PasswordResetToken>,
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

    if (dto.role === UserRole.User) {
      const profile = this.customerRepo.create({
        accountId: savedAccount.accountId,
        fullName: dto.fullName,
        purpose: dto.purpose,
      });
      await this.customerRepo.save(profile);
    }

    if (dto.role === UserRole.Owner) {
      const profile = this.ownerRepo.create({
        accountId: savedAccount.accountId,
        fullName: dto.fullName,
      });
      await this.ownerRepo.save(profile);
    }

    const tokens = await this.issueTokens(savedAccount);

    return {
      account: this.sanitizeAccount(savedAccount),
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

    return {
      account: this.sanitizeAccount(account),
      tokens,
    };
  }

  async refresh(dto: RefreshDto) {
    const refreshSecret = this.getRefreshSecret();
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
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

    return {
      account: this.sanitizeAccount(account),
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

    return {
      account: this.sanitizeAccount(account),
      profile: account.customerProfile ?? account.ownerProfile ?? null,
      profileCompleted,
    };
  }

  async completeDinerProfile(accountId: number, dto: DinerProfileDto) {
    const account = await this.userRepo.findOne({
      where: { accountId },
      relations: { customerProfile: true },
    });

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    if (account.role !== UserRole.User) {
      throw new ForbiddenException('Only diner accounts can update this profile.');
    }

    const dob = this.normalizeDate(dto.dob);
    const gender = this.normalizeGender(dto.gender);

    const profile =
      account.customerProfile ??
      this.customerRepo.create({
        accountId: account.accountId,
        fullName: dto.displayName,
      });

    profile.displayName = dto.displayName;
    profile.dob = dob;
    profile.gender = gender;
    profile.nationality = dto.nationality;

    const savedProfile = await this.customerRepo.save(profile);

    return {
      account: this.sanitizeAccount(account),
      profile: savedProfile,
    };
  }

  async completeMerchantProfile(accountId: number, dto: MerchantProfileDto) {
    const account = await this.userRepo.findOne({
      where: { accountId },
      relations: { ownerProfile: true },
    });

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    if (account.role !== UserRole.Owner) {
      throw new ForbiddenException('Only owner accounts can update this profile.');
    }

    const ownerProfile =
      account.ownerProfile ??
      this.ownerRepo.create({
        accountId: account.accountId,
        fullName: dto.representativeName,
      });

    ownerProfile.fullName = dto.representativeName;
    ownerProfile.phone = dto.phone;
    ownerProfile.businessName = dto.storeName;

    const savedOwnerProfile = await this.ownerRepo.save(ownerProfile);

    const existingRestaurant = await this.restaurantRepo.findOne({
      where: { ownerAccountId: account.accountId },
    });

    const restaurant =
      existingRestaurant ??
      this.restaurantRepo.create({
        ownerAccountId: account.accountId,
        nameVn: dto.storeName,
        nameJp: dto.storeNameJp ?? dto.storeName,
        address: dto.address,
        phone: dto.phone,
        openingHours: dto.openingHours,
        issuesVat: dto.issuesVat ?? false,
      });

    if (existingRestaurant) {
      restaurant.nameVn = dto.storeName;
      restaurant.nameJp = dto.storeNameJp ?? dto.storeName;
      restaurant.address = dto.address;
      restaurant.phone = dto.phone;
      restaurant.openingHours = dto.openingHours;
      restaurant.issuesVat = dto.issuesVat ?? false;
    }

    const savedRestaurant = await this.restaurantRepo.save(restaurant);

    return {
      account: this.sanitizeAccount(account),
      ownerProfile: savedOwnerProfile,
      restaurant: savedRestaurant,
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
      tokens,
      guest: true,
    };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const email = dto.email.trim().toLowerCase();
    const account = await this.userRepo.findOne({
      where: { email: ILike(email) },
    });

    // Always return the same message to prevent email enumeration
    if (!account) {
      return {
        message: 'If the account exists, a reset link has been sent.',
      };
    }

    // Invalidate all previous unused tokens for this account
    await this.resetRepo.update(
      { accountId: account.accountId, usedAt: IsNull() },
      { usedAt: new Date() },
    );

    // Generate a secure random token (plain) — only the hash is stored in DB
    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashResetToken(token);
    const expiresAt = new Date(
      Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000,
    );

    const resetToken = this.resetRepo.create({
      accountId: account.accountId,
      tokenHash,
      expiresAt,
    });
    await this.resetRepo.save(resetToken);

    // Detect preferred language from email domain heuristic (ja for .jp addresses)
    const lang: 'vi' | 'ja' = dto.lang ?? (email.endsWith('.jp') ? 'ja' : 'vi');

    // Send the email (non-blocking in dev — failures are logged, not thrown)
    await this.mailService.sendPasswordReset({ to: account.email, resetToken: token, lang });

    const response: { message: string; resetToken?: string } = {
      message: 'If the account exists, a reset link has been sent.',
    };

    // Expose raw token in response only in development for easy API testing
    if (this.configService.get<string>('NODE_ENV') === 'development') {
      response.resetToken = token;
    }

    return response;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashResetToken(dto.token);
    const record = await this.resetRepo.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!record) {
      throw new BadRequestException('Reset token is invalid or expired.');
    }

    const account = await this.userRepo.findOne({
      where: { accountId: record.accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    account.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(account);

    record.usedAt = new Date();
    await this.resetRepo.save(record);

    return {
      message: 'Password updated successfully.',
    };
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

  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
