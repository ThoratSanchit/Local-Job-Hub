import UserRepository from '../repositories/user.repository';
import { AvailabilityStatus } from '../enums/availability.status.enum';
import { IUpdateUser, IUpdateUserLocation } from '../interfaces/user.interface';
import Messages from '../language/en/message.language';
import CustomError from '../utility/customError.utility';
import LocationService, { NormalizedLocation } from './location.service';

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

  private async resolveUserLocation(data: IUpdateUser | IUpdateUserLocation): Promise<NormalizedLocation | null> {
    const hasAnyCoordinate = data.latitude !== undefined && data.latitude !== null
      || data.longitude !== undefined && data.longitude !== null;
    const hasCoordinatePair = data.latitude !== undefined && data.latitude !== null
      && data.longitude !== undefined && data.longitude !== null;
    const hasAnyManualAddress = data.city !== undefined && data.city !== null
      || data.area !== undefined && data.area !== null
      || data.pincode !== undefined && data.pincode !== null;
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

      return LocationService.reverseGeocode(Number(data.latitude), Number(data.longitude));
    }

    if (hasAnyManualAddress) {
      if (!hasManualAddress) {
        throw new CustomError(400, Messages.LOCATION_FIELDS_REQUIRED);
      }

      const { city, area, pincode } = data as { city: string; area: string; pincode: string };
      return LocationService.geocode(city, area, pincode);
    }

    return null;
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

    const location = await this.resolveUserLocation(data);
    await UserRepository.updateProfile(userId, {
      ...data,
      ...(location ?? {}),
    });
    return this.getMe(userId);
  }

  async updateLocation(userId: string, data: IUpdateUserLocation) {
    const location = await this.resolveUserLocation(data);

    if (!location) {
      throw new CustomError(400, Messages.INVALID_LOCATION_PAYLOAD);
    }

    await UserRepository.updateProfile(userId, location);
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
