import * as bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

const SALT_ROUNDS = 10

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } })
  }

  async createSchool(name: string, email: string, password: string): Promise<User> {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = this.repo.create({
      name,
      email,
      password_hash,
      role: 'school',
      approved: 0,
    })
    return this.repo.save(user)
  }

  findPendingSchools(): Promise<User[]> {
    return this.repo.find({
      where: { role: 'school', approved: 0 },
      order: { created_at: 'DESC' },
    })
  }

  approve(id: number): Promise<User> {
    return this.repo.update(id, { approved: 1 }).then(() => this.repo.findOneOrFail({ where: { id } }))
  }

  async ensureAdminExists(): Promise<void> {
    const admin = await this.repo.findOne({ where: { role: 'admin' } })
    if (!admin) {
      const password_hash = await bcrypt.hash('admin123', SALT_ROUNDS)
      await this.repo.save(
        this.repo.create({
          email: 'admin@escola.com',
          password_hash,
          name: 'Administrador Geral',
          role: 'admin',
          approved: 1,
        }),
      )
    }
  }
}
