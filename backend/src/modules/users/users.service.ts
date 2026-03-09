import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } })
  }

  createSchool(name: string, email: string, password: string): Promise<User> {
    const user = this.repo.create({
      name,
      email,
      password_hash: password,
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

  ensureAdminExists(): Promise<void> {
    return this.repo.findOne({ where: { role: 'admin' } }).then((admin) => {
      if (!admin) {
        return this.repo.save(
          this.repo.create({
            email: 'admin@escola.com',
            password_hash: 'admin123',
            name: 'Administrador Geral',
            role: 'admin',
            approved: 1,
          }),
        ).then(() => undefined)
      }
      return undefined
    })
  }
}
