import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from './entities/role.entity';
import { Role } from './decorators/roles/role.enum';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  constructor(
    @InjectModel(UserRole.name) private readonly UserRoleModel: Model<UserRole>,
  ) {}

  /**
   * Get the current user role for the given user id.
   * Returns null if no user id is provided.
   * @param userId
   * @returns
   */
  async getUserRole(userId: number): Promise<string> {
    if (!userId) {
      this.logger.debug(`No user id provided; returning null role`);
      return null;
    }
    const userRole = await this.UserRoleModel.findOne({ userId }, { role: 1 });
    this.logger.debug(`User ${userId} has role ${userRole?.role}`);
    return userRole?.role ?? null;
  }

  /**
   * Sets the user role for the given user id.
   * Will return an error if the user role has already been set (we'll consider it static for this exercise), or if there is an error creating the role.
   */
  async setUserRoleByUserId(
    userId: number,
    role: Role,
  ): Promise<UserRole | Error> {
    const currentRole = await this.getUserRole(userId);
    if (currentRole) {
      this.logger.debug(`User ${userId} already has role ${currentRole}`);
      return new Error('User role has already been set.');
    }

    try {
      const roleDocument = await this.UserRoleModel.create({
        role,
        userId,
      });
      this.logger.debug(`Created role ${roleDocument.id} for user ${userId}`);
      return roleDocument;
    } catch (error) {
      this.logger.error(
        `Error occurred creating role for user ${userId}`,
        error,
      );
      return error;
    }
  }
}
