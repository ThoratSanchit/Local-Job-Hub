import UserRepository from '../repositories/user.repository';
import { AvailabilityStatus } from '../enums/availability.status.enum';
import { IUpdateUser } from '../interfaces/user.interface';
import Messages from '../language/en/message.language';
import CustomError from '../utility/customError.utility';

class UserService {
  private validateSkills(skills: IUpdateUser['skills']) {
    if (
      skills !== undefined &&
      skills !== null &&
      (!Array.isArray(skills) || skills.some((skill) => typeof skill !== 'string'))
    ) {
      throw new CustomError(400, Messages.INVALID_SKILLS);
    }
  }

  async getMe(userId: string) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new CustomError(404, Messages.USER_NOT_FOUND);
    }

    return user;
  }

  async getUser(userId: string) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new CustomError(404, Messages.USER_NOT_FOUND);
    }

    return user;
  }

  async updateProfile(userId: string, data: IUpdateUser) {
    this.validateSkills(data.skills);

    await UserRepository.updateProfile(userId, data);
    return this.getMe(userId);
  }

  async toggleAvailability(userId: string, availability_status: AvailabilityStatus) {
    const validStatuses = Object.values(AvailabilityStatus) as string[];
    
    if (!validStatuses.includes(availability_status)) {
      throw new CustomError(
        400,
        `${Messages.INVALID_AVAILABILITY_STATUS}. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    await UserRepository.updateProfile(userId, { availability_status });
  }

}

export default new UserService();
