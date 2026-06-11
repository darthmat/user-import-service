import { ValidationError } from '../../utils/errors';
import { UserCreateDto } from './user.dto';
import { uuidv7 } from 'uuidv7';

export class User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly createdAt: Date;

  private constructor(data: UserData) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.createdAt = data.createdAt;
  }

  static create(data: UserCreateDto): User {
    this.validate(data);

    return new User({
      id: uuidv7(),
      username: data.username,
      email: data.email,
      createdAt: new Date(),
    });
  }

  static fromData(data: UserData): User {
    return new User(data);
  }

  private static validate(data: UserCreateDto): void {
    if (!data.username.trim().length) {
      throw new ValidationError('Username cannot be empty');
    }

    if (data.username.length > 50) {
      throw new ValidationError('Username cannot exceed 50 characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      throw new ValidationError(
        'Username can only contain letters, numbers, underscores and hyphens',
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }
  }
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}
