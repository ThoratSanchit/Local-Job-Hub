import User from '../models/user.model';

class UserRepository {
  async findById(userId: string) {
    return await User.findByPk(userId);
  }

  async findAll() {
    return await User.findAll();
  }

  async createUser(data: any) {
    return await User.create(data);
  }
}

export default new UserRepository();
