import User from '../models/user.model';

class UserRepository {
  findById(id: string) {
    return User.findByPk(id, { attributes: { exclude: ['password'] } });
  }

  findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  findAll() {
    return User.findAll({ attributes: { exclude: ['password'] } });
  }

  createUser(data: Partial<User>) {
    return User.create(data as any);
  }

  updateUser(id: string, data: Partial<User>) {
    return User.update(data as any, { where: { id } });
  }
}

export default new UserRepository();
