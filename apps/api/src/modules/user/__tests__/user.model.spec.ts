import { describe, expect, it } from 'vitest';
import { User } from '../user.model';

describe('User', () => {
  describe('create', () => {
    it('creates User with generated id', () => {
      const createdUser = User.create({
        username: 'JohnDoe',
        email: 'johndoe@example.com',
      });

      expect(createdUser).toBeInstanceOf(User);
      expect(createdUser).toEqual({
        id: expect.any(String),
        username: 'JohnDoe',
        email: 'johndoe@example.com',
        createdAt: expect.any(Date),
      });
    });

    it('should throw validation error if username is not sent', () => {
      expect(() =>
        User.create({
          username: '',
          email: 'johndoe@example.com',
        }),
      ).toThrow('Validation failed: Username cannot be empty');
    });

    it('should throw validation error if username is too long', () => {
      expect(() =>
        User.create({
          username: 'x'.repeat(51),
          email: 'johndoe@example.com',
        }),
      ).toThrow('Validation failed: Username cannot exceed 50 characters');
    });

    it('should throw validation error if username contain not valid chars', () => {
      expect(() =>
        User.create({
          username: 'John Doe',
          email: 'johndoe@example.com',
        }),
      ).toThrow(
        'Validation failed: Username can only contain letters, numbers, underscores and hyphens',
      );
    });

    it('accepts username with exactly 50 characters', () => {
      expect(() =>
        User.create({ username: 'x'.repeat(50), email: 'johndoe@example.com' }),
      ).not.toThrow();
    });

    it('should throw validation error if email is not valid', () => {
      expect(() =>
        User.create({
          username: 'JohnDoe',
          email: 'johndoeexample.com',
        }),
      ).toThrow('Validation failed: Invalid email format');
    });

    it('should throw if email is empty', () => {
      expect(() => User.create({ username: 'JohnDoe', email: '' })).toThrow(
        'Validation failed: Invalid email format',
      );
    });

    describe('normalization', () => {
      it('should trim whitespace and lowercase the email address', () => {
        const createdUser = User.create({
          username: 'JohnDoe',
          email: '  jOhN.DoE@DoMaIn.CoM  ',
        });

        expect(createdUser.email).toBe('john.doe@domain.com');
      });

      it('should trim whitespace from username', () => {
        const createdUser = User.create({
          username: '  ValidUsername  ',
          email: 'johndoe@example.com',
        });

        expect(createdUser.username).toBe('ValidUsername');
      });
    });
  });

  describe('fromData', () => {
    it('creates User from persistence data', () => {
      const date = new Date();
      const fromDataUser = User.fromData({
        id: 'test-id',
        username: 'JohnDoe',
        email: 'johndoe@example.com',
        createdAt: date,
      });

      expect(fromDataUser).toBeInstanceOf(User);
      expect(fromDataUser).toEqual({
        id: 'test-id',
        username: 'JohnDoe',
        email: 'johndoe@example.com',
        createdAt: date,
      });
    });
  });
});
