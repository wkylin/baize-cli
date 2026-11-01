import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userService } from './users';

const data = new Map<string, string>();

beforeEach(() => {
  data.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
  });
  vi.stubGlobal('crypto', { randomUUID: () => 'new-user' });
});

describe('userService', () => {
  it('creates, updates, and removes users', async () => {
    const created = await userService.save({
      name: '  Ada  ',
      email: '  ADA@example.com  ',
      role: 'admin',
      status: 'active',
    });
    expect(created).toMatchObject({
      id: 'new-user',
      name: 'Ada',
      email: 'ada@example.com',
    });
    await userService.save({ ...created, name: 'Ada Lovelace' }, created.id);
    expect(
      (await userService.list()).find((user) => user.id === created.id)?.name
    ).toBe('Ada Lovelace');
    await userService.remove(created.id);
    expect(
      (await userService.list()).some((user) => user.id === created.id)
    ).toBe(false);
  });

  it('rejects duplicate emails and missing users', async () => {
    await expect(
      userService.save({
        name: 'Duplicate',
        email: 'LIN.YUE@example.com',
        role: 'viewer',
        status: 'active',
      })
    ).rejects.toThrow();
    await expect(
      userService.save(
        {
          name: 'Missing',
          email: 'missing@example.com',
          role: 'viewer',
          status: 'active',
        },
        'missing'
      )
    ).rejects.toThrow();
  });
});
