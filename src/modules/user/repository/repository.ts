import { Repository } from 'typeorm'
import { User } from '../../../models/user'
import { AppDataSource } from '../../../data-source'

export interface IUserRepo {
  createUser(params: Partial<User>): Promise<User>
  getUser(id: string): Promise<User | null>
  getByEmail(email: string): Promise<User | null>
  getUserByNif(nif: string): Promise<User | null>
  getBalance(id: string): Promise<number | undefined>
  emailExists(email: string): Promise<boolean>
  nifExists(nif: string): Promise<boolean>
}

export class UserRepo implements IUserRepo {
  private userRepo: Repository<User>
  constructor() {
    this.userRepo = AppDataSource.getRepository(User)
  }
  getUserByNif(nif: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { nif } })
  }
  getByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } })
  }
  async nifExists(nif: string) {
    const count = await this.userRepo.count({ where: { nif } })
    return count > 0
  }

  async emailExists(email: string) {
    const count = await this.userRepo.count({ where: { email } })
    return count > 0
  }

  async createUser(params: Partial<User>) {
    const user = this.userRepo.create(params)
    return this.userRepo.save(user)
  }

  async getUser(id: string) {
    return this.userRepo.findOne({ where: { id } })
  }

  async getBalance(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['balance'],
    })
    return user?.balance
  }
}
