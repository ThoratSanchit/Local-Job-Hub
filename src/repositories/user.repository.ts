import User from '../models/user.model';
import { IUpdateUser } from '../interfaces/user.interface';

class UserRepository {
  findById(id: string) {
    return User.findByPk(id);
  }

  // findByEmail(email: string) {
  //   return User.findOne({ where: { email } });
  // }

  findByMobile(mobile_number: string) {
    return User.findOne({ where: { mobile_number } });
  }

  findAll() {
    return User.findAll();
  }

  createUser(data: Partial<User>) {
    return User.create(data as any);
  }

  updateUser(id: string, data: Partial<User>) {
    return User.update(data as any, { where: { id } });
  }

  updateProfile(id: string, data: IUpdateUser) {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );

    return User.update(updateData, { where: { id } });
  }
}

export default new UserRepository();
