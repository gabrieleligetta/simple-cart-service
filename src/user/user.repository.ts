import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { AbstractRepositoryBase } from '../../libs/repo/abstact.repository';
import { Role } from './libs/enums/roles.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository extends AbstractRepositoryBase<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) repo: Repository<UserEntity>,
    dataSource: DataSource,
  ) {
    super(repo, dataSource);
  }

  /** On application startup, ensure an admin user exists */
  async onModuleInit(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL?.trim() || 'admin@test.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Secret!123!';

    // Try to find existing admin
    const existing = await this.repo.findOne({
      where: { email: adminEmail },
    });
    if (existing) {
      console.log(`Admin user already exists: ${adminEmail}`);
      return;
    }

    // Hash password and create
    const hashed = await bcrypt.hash(adminPassword, 10);
    const admin = this.repo.create({
      email: adminEmail,
      password: hashed,
      role: Role.ADMIN,
    });
    await this.repo.save(admin);

    console.log(
      `Created default admin user: ${adminEmail} (password from ADMIN_PASSWORD env)`,
    );
  }
}
