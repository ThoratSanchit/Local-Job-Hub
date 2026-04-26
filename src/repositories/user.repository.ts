import User from '../models/user.model';

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
}

export default new UserRepository();
