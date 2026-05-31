import UserRepository from '../repositories/user.repository';
import { AvailabilityStatus } from '../enums/availability.status.enum';
import { IUpdateUser, IUpdateUserLocation } from '../interfaces/user.interface';
import Messages from '../language/en/message.language';
import CustomError from '../utility/customError.utility';
import LocationService from './location.service';

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

  async updateLocation(userId: string, data: IUpdateUserLocation) {
    const hasAnyCoordinate = data.latitude !== undefined || data.longitude !== undefined;
    const hasCoordinatePair = data.latitude !== undefined && data.longitude !== undefined;
    const hasAnyManualAddress = data.city !== undefined || data.area !== undefined || data.pincode !== undefined;
    const hasManualAddress =
      typeof data.city === 'string' &&
      typeof data.area === 'string' &&
      typeof data.pincode === 'string';

    if (hasAnyCoordinate && hasAnyManualAddress) {
      throw new CustomError(400, Messages.INVALID_LOCATION_PAYLOAD);
    }

    if (hasAnyCoordinate) {
      if (!hasCoordinatePair) {
        throw new CustomError(400, Messages.INVALID_LOCATION_PAYLOAD);
      }

      const location = await LocationService.reverseGeocode(Number(data.latitude), Number(data.longitude));
      await UserRepository.updateProfile(userId, location);
      return this.getMe(userId);
    }

    if (hasAnyManualAddress) {
      if (!hasManualAddress) {
        throw new CustomError(400, Messages.LOCATION_FIELDS_REQUIRED);
      }

      const { city, area, pincode } = data as Required<Pick<IUpdateUserLocation, 'city' | 'area' | 'pincode'>>;
      const location = await LocationService.geocode(city, area, pincode);
      await UserRepository.updateProfile(userId, location);
      return this.getMe(userId);
    }

    throw new CustomError(400, Messages.INVALID_LOCATION_PAYLOAD);
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
