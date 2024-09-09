import { Repository } from 'typeorm'
import { UpdateUserdto, User } from '../../../models/user'
import { AppDataSource } from '../../../data-source'

export interface IUserRepo {
  createUser(params: Partial<User>): Promise<User>
  getUser(id: string): Promise<User | null>
  getByEmail(email: string): Promise<User | null>
  getUserByNif(nif: string): Promise<User | null>
  getBalance(id: string): Promise<number | undefined>
  emailExists(email: string): Promise<boolean>
  nifExists(nif: string): Promise<boolean>
  updateUser(id: string, params: UpdateUserdto): void
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

  async updateUser(id: string, params: UpdateUserdto) {
    const updates: Partial<User> = {}


    if (params.balance && params.balance >= 0) {
        updates.balance = params.balance
    }
    // Check and add email to updates if it's a valid email format
    if (params.email && params.email.trim() !== '') {
      updates.email = params.email
    }

    // Check and add fullname to updates if it's not empty
    if (params.fullname && params.fullname.trim() !== '') {
      updates.fullName = params.fullname
    }

    // Check and add nif to updates if it's in a valid format (custom validation logic)
    if (params.nif && params.nif.trim() !== '') {
      // Replace isValidNif with your own validation function
      updates.nif = params.nif
    }

    // Perform the update if there are any changes
    if (Object.keys(updates).length > 0) {
      await this.userRepo.update(id, updates)
    }
  }
}
