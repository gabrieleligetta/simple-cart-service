// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';

/* -----------------------------------------------------------------------
 *  NOTE
 *  ----
 *  • UserRepository already has:  create · findById · findBy · update · delete · list
 *  • Here we provide thin wrappers that express the domain intent in plain English.
 * --------------------------------------------------------------------- */
@Injectable()
export class UserService {
  constructor(private readonly users: UserRepository) {}

  /** Find one user by e‑mail (case‑insensitive) */
  findByEmail(email: string): Promise<UserEntity | null> {
    return this.users.findBy('email', email.toLowerCase());
  }

  /** Find one user by primary id */
  findById(id: number): Promise<UserEntity | null> {
    return this.users.findById(id);
  }

  /** List every user (newest first) */
  getAllUsers(): Promise<UserEntity[]> {
    return this.users.list({ order: { createdAt: 'DESC' } });
  }

  /** Persist a new user (e‑mail + already‑hashed password) */
  createUser(email: string, hashedPassword: string): Promise<UserEntity> {
    return this.users.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });
  }

  /**
   * Update any mutable fields; returns the updated entity
   * Example call: updateUser(1, { firstname: 'Alice' })
   */
  updateUser(
    id: number,
    changes: Partial<Omit<UserEntity, 'id' | 'createdAt'>>,
  ): Promise<UserEntity | null> {
    return this.users.update(id, changes);
  }

  /**
   * Remove a user; returns true if a record was deleted.
   * (Consider soft‑delete in real projects.)
   */
  deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
}
