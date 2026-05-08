import JobRepository from '../repositories/job.repository';
import JobResponseRepository from '../repositories/jobResponse.repository';
import UserRepository from '../repositories/user.repository';
import { AvailabilityStatus } from '../enums/availability.status.enum';
import { IUpdateUser } from '../interfaces/user.interface';
import Messages from '../language/en/message.language';
import CustomError from '../utility/customError.utility';

class UserService {
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

  getMyPostedJobs(userId: string) {
    return JobRepository.findByCreator(userId);
  }

  getMyAcceptedJobs(userId: string) {
    return JobResponseRepository.findByWorkerAccepted(userId);
  }
}

export default new UserService();
