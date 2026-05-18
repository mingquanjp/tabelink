import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileTextDto } from './dto/update-profile.dto';
import { UserProfileService } from './user-profile.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('user-profile')
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub; // ID lấy từ token
    const profile = await this.userProfileService.getProfile(userId, userId);
    const blogs = await this.userProfileService.getUserBlogs(userId);
    return { ...profile, blogs };
  }

  @Get(':accountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xem chi tiết hồ sơ và danh sách blog' })
  async getFullProfile(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const profile = await this.userProfileService.getProfile(
      accountId,
      req.user.sub,
    );
    const blogs = await this.userProfileService.getUserBlogs(accountId);
    return { ...profile, blogs };
  }

  @Get('me/edit-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy dữ liệu hiện tại để đổ vào form chỉnh sửa' })
  getEditData(@Req() req: AuthenticatedRequest) {
    return this.userProfileService.getProfile(req.user.sub, req.user.sub);
  }

  // @Patch('me')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access-token')
  // @ApiOperation({ summary: 'Cập nhật thông tin hồ sơ' })
  // updateProfile(
  //   @Req() req: AuthenticatedRequest,
  //   @Body() updateProfileDto: UpdateProfileDto,
  // ) {
  //   return this.userProfileService.updateProfile(
  //     req.user.sub,
  //     updateProfileDto,
  //   );
  // }
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async updateProfileText(
    @Req() req: AuthenticatedRequest,
    @Body() updateDto: UpdateProfileTextDto,
  ) {
    return this.userProfileService.updateProfileText(req.user.sub, updateDto);
  }
  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  async uploadAvatar(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: any,
  ) {
    return this.userProfileService.uploadAvatar(req.user.sub, file);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userProfileService.changePassword(
      req.user.sub,
      changePasswordDto,
    );
  }
}
