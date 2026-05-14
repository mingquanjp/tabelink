import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfile } from './entities/customer-profile.entity';
import { OwnerProfile } from './entities/owner-profile.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { UserAccount } from './entities/user-account.entity';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserAccount,
      CustomerProfile,
      OwnerProfile,
      Restaurant,
    ]),
    PassportModule,
    JwtModule.register({}),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
