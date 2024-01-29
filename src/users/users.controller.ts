import {
  Controller,
  Get,
  Headers,
  Logger,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { HasRole } from '../authorization/decorators/roles/role.decorator';
import { Role } from '../authorization/decorators/roles/role.enum';
import { HasRoleGuard } from '../authorization/guards/has-role/has-role.guard';
import { APP_CONSTANTS } from '../config';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAPIToken } from '../authorization/decorators/user-api-token/user-api-token.decorator';

@Controller('users')
@UseGuards(HasRoleGuard)
@ApiTags('users')
@ApiBearerAuth(APP_CONSTANTS.AUTH_HEADER)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HasRole(Role.USER)
  async findOne(@UserAPIToken() userId: string) {
    this.logger.debug(`Finding user ${userId}`);
    const user = await this.usersService.findOne(+userId);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
