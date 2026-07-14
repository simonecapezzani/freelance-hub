import bcrypt from 'bcryptjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { User } from '../../src/models/user.model.ts';
import { register } from '../../src/services/auth.service.ts';

const originalPassword = 'secret123';

function createUserDocument(password: string) {
  return {
    _id: { toString: () => 'user-id' },
    email: 'simone@example.com',
    password,
    name: 'Simone',
    createdAt: new Date('2026-07-14T00:00:00.000Z'),
  };
}

describe('auth service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hashes the password before creating a user', async () => {
    const createdUser = createUserDocument('hashed-password');
    const findOne = vi.spyOn(User, 'findOne').mockResolvedValue(null);
    const create = vi.spyOn(User, 'create').mockResolvedValue(createdUser as never);

    await register({
      email: 'Simone@Example.com',
      password: originalPassword,
      name: 'Simone',
    });

    expect(findOne).toHaveBeenCalledWith({ email: 'simone@example.com' });

    const createPayload = create.mock.calls[0][0] as {
      email: string;
      password: string;
      name: string;
    };

    expect(createPayload.email).toBe('simone@example.com');
    expect(createPayload.name).toBe('Simone');
    expect(createPayload.password).not.toBe(originalPassword);
    await expect(
      bcrypt.compare(originalPassword, createPayload.password),
    ).resolves.toBe(true);
  });

  it('rejects an email that is already registered', async () => {
    const existingUser = createUserDocument('existing-hash');
    const findOne = vi.spyOn(User, 'findOne').mockResolvedValue(existingUser as never);
    const create = vi.spyOn(User, 'create');

    await expect(
      register({
        email: 'simone@example.com',
        password: originalPassword,
        name: 'Simone',
      }),
    ).rejects.toThrow('Email already in use');

    expect(findOne).toHaveBeenCalledWith({ email: 'simone@example.com' });
    expect(create).not.toHaveBeenCalled();
  });
});
