import {
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
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { AdminUserActionDto } from './dto/admin-user-action.dto';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { ListAdminActionLogsQueryDto } from './dto/list-admin-action-logs-query.dto';
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
  constructor(private readonly adminService: AdminService) {}

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
}
