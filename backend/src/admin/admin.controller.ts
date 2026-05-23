import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Readable } from 'node:stream';
import type { Request, Response } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { AdminService } from './admin.service';
import { AdminUserActionDto } from './dto/admin-user-action.dto';
import { AdminVerificationActionDto } from './dto/admin-verification-action.dto';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { ListAdminActionLogsQueryDto } from './dto/list-admin-action-logs-query.dto';
import { ListAdminVerificationApplicationsQueryDto } from './dto/list-admin-verification-applications-query.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('admin-users')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({ description: 'Only admins can use these endpoints.' })
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  @Get('users')
  @ApiOperation({
    summary: 'List users with search, role/status filters, and KPI summary',
    description:
      'Feature ID 21 / screen ID16. Returns paged users, filter options, and overview KPI counts.',
  })
  @ApiOkResponse({ description: 'Admin user list.' })
  listUsers(
    @Query() query: ListAdminUsersQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.listUsers(query, request.user);
  }

  @Get('users/kpis')
  @ApiOperation({
    summary: 'Get admin user KPI overview',
    description: 'Feature ID 21 / screen ID16 KPI cards for user management.',
  })
  @ApiOkResponse({ description: 'Admin user KPI overview.' })
  getUserKpis(@Req() request: AuthenticatedRequest) {
    return this.adminService.getUserKpis(request.user);
  }

  @Patch('users/:accountId')
  @ApiOperation({
    summary: 'Edit user account and profile information',
    description:
      'Updates email, status, role, and role-specific profile fields. Role changes are enforced immediately by JWT validation.',
  })
  @ApiOkResponse({ description: 'User updated.' })
  @ApiNotFoundResponse({ description: 'User account was not found.' })
  updateUser(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: UpdateAdminUserDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.updateUser(accountId, dto, request.user);
  }

  @Patch('users/:accountId/role')
  @ApiOperation({
    summary: 'Change user role',
    description:
      'Dedicated role-change endpoint for Feature ID 21. Permissions update on the next authenticated request.',
  })
  @ApiOkResponse({ description: 'User role changed.' })
  @ApiNotFoundResponse({ description: 'User account was not found.' })
  changeRole(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: ChangeUserRoleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.changeRole(accountId, dto, request.user);
  }

  @Post('users/:accountId/ban')
  @ApiOperation({
    summary: 'Ban user account with reason',
    description:
      'Sets USER_ACCOUNT.Status to Banned, logs the reason, and blocks future authenticated requests and login.',
  })
  @ApiOkResponse({ description: 'User banned.' })
  @ApiNotFoundResponse({ description: 'User account was not found.' })
  banUser(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: AdminUserActionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.setBan(accountId, dto, request.user);
  }

  @Post('users/:accountId/restore')
  @ApiOperation({
    summary: 'Restore banned or disabled user account with reason',
    description:
      'Sets USER_ACCOUNT.Status back to Active and records admin log.',
  })
  @ApiOkResponse({ description: 'User restored.' })
  @ApiNotFoundResponse({ description: 'User account was not found.' })
  restoreUser(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: AdminUserActionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.restore(accountId, dto, request.user);
  }

  @Delete('users/:accountId')
  @ApiOperation({
    summary: 'Soft-delete user account with reason',
    description:
      'Logical delete only: sets USER_ACCOUNT.Status to Disabled and records admin log.',
  })
  @ApiOkResponse({ description: 'User logically deleted.' })
  @ApiNotFoundResponse({ description: 'User account was not found.' })
  softDeleteUser(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() dto: AdminUserActionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.softDelete(accountId, dto, request.user);
  }

  @Get('action-logs')
  @ApiOperation({
    summary: 'List admin action logs',
    description:
      'Returns action time, acting admin, target user, action content, and reason.',
  })
  @ApiOkResponse({ description: 'Admin action logs.' })
  listActionLogs(
    @Query() query: ListAdminActionLogsQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.listActionLogs(query, request.user);
  }

  @Get('restaurants/:restaurantId/detail')
  @ApiOperation({
    summary: 'Get restaurant detail for admin review',
    description:
      'Returns restaurant detail for admin read-only review without requiring the restaurant to be Active.',
  })
  @ApiOkResponse({ description: 'Admin restaurant detail.' })
  @ApiNotFoundResponse({ description: 'Restaurant was not found.' })
  getAdminRestaurantDetail(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.restaurantsService.getAdminRestaurantDetail(
      restaurantId,
      request.user,
    );
  }

  @Get('verification/applications')
  @ApiOperation({
    summary: 'List badge verification applications for admin screen ID15',
    description:
      'Returns pending/approved/rejected badge applications with restaurant detail for the admin badge review screen.',
  })
  @ApiOkResponse({ description: 'Paged badge application list.' })
  listVerificationApplications(
    @Query() query: ListAdminVerificationApplicationsQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.listVerificationApplications(query, request.user);
  }

  @Get('verification/applications/:appId')
  @ApiOperation({
    summary: 'Get badge verification application detail',
    description:
      'Returns one application selected from the ID15 application list.',
  })
  @ApiOkResponse({ description: 'Badge application detail.' })
  @ApiNotFoundResponse({ description: 'Badge application was not found.' })
  getVerificationApplication(
    @Param('appId', ParseIntPipe) appId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.getVerificationApplication(appId, request.user);
  }

  @Get('verification/applications/:appId/documents/:documentType')
  @ApiOperation({
    summary: 'Open a submitted verification document for admin review',
    description:
      'Streams the Cloudinary document through the backend so admin can open PDF/JPG/PNG evidence from screen ID15.',
  })
  @ApiOkResponse({ description: 'Verification document file.' })
  @ApiNotFoundResponse({ description: 'Verification document was not found.' })
  async openVerificationDocument(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('documentType') documentType: string,
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    if (
      documentType !== 'business-license' &&
      documentType !== 'food-safety-certificate'
    ) {
      throw new BadRequestException('Unsupported verification document type.');
    }

    const document = await this.adminService.getVerificationDocument(
      appId,
      documentType,
      request.user,
    );

    for (const url of document.urls) {
      const upstream = await fetch(url);
      const upstreamContentType =
        upstream.headers.get('content-type') ?? 'application/octet-stream';
      const contentType =
        upstreamContentType === 'application/octet-stream'
          ? document.contentType
          : upstreamContentType;

      if (
        !upstream.ok ||
        !upstream.body ||
        upstreamContentType.includes('text/html')
      ) {
        continue;
      }

      const extension = contentType.includes('pdf')
        ? '.pdf'
        : contentType.includes('png')
          ? '.png'
          : contentType.includes('jpeg') || contentType.includes('jpg')
            ? '.jpg'
            : '';

      response.setHeader('Content-Type', contentType);
      response.setHeader(
        'Content-Disposition',
        `inline; filename="${document.fileName}${extension}"`,
      );
      response.setHeader('Cache-Control', 'private, max-age=60');

      const contentLength = upstream.headers.get('content-length');
      if (contentLength) {
        response.setHeader('Content-Length', contentLength);
      }

      Readable.fromWeb(upstream.body as any).pipe(response);
      return;
    }

    throw new BadRequestException('Failed to open verification document.');
  }

  @Patch('verification/applications/:appId/approve')
  @ApiOperation({
    summary: 'Approve badge application and grant restaurant badge',
    description:
      'Screen ID15 action 3-22. Sets the application to Approved and upserts RESTAURANT_BADGE.',
  })
  @ApiOkResponse({ description: 'Badge application approved.' })
  approveVerificationApplication(
    @Param('appId', ParseIntPipe) appId: number,
    @Body() dto: AdminVerificationActionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.approveVerificationApplication(
      appId,
      dto,
      request.user,
    );
  }

  @Patch('verification/applications/:appId/reject')
  @ApiOperation({
    summary: 'Reject badge application with reason',
    description:
      'Screen ID15 action 3-24. Rejection reason is stored in ReviewNote.',
  })
  @ApiOkResponse({ description: 'Badge application rejected.' })
  rejectVerificationApplication(
    @Param('appId', ParseIntPipe) appId: number,
    @Body() dto: AdminVerificationActionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.rejectVerificationApplication(
      appId,
      dto,
      request.user,
    );
  }

  @Patch('verification/applications/:appId/request-info')
  @ApiOperation({
    summary: 'Request additional information for a badge application',
    description:
      'Screen ID15 action 3-23. Current schema has no separate RequestedInfo status, so the application remains Pending and the message is stored in ReviewNote.',
  })
  @ApiOkResponse({ description: 'Additional information requested.' })
  requestVerificationInformation(
    @Param('appId', ParseIntPipe) appId: number,
    @Body() dto: AdminVerificationActionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.requestVerificationInformation(
      appId,
      dto,
      request.user,
    );
  }

  @Patch('verification/applications/:appId/revoke')
  @ApiOperation({
    summary: 'Revoke an already granted badge',
    description:
      'Screen ID15 issued tab action. Current database has no Revoked status, so this removes RESTAURANT_BADGE and marks the application as Rejected with a revoke note.',
  })
  @ApiOkResponse({ description: 'Badge revoked.' })
  revokeVerificationBadge(
    @Param('appId', ParseIntPipe) appId: number,
    @Body() dto: AdminVerificationActionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.revokeVerificationBadge(appId, dto, request.user);
  }
}
