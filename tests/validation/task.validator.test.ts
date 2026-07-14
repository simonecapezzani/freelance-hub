import { describe, expect, it } from 'vitest';
import {
  validateCreateTaskPayload,
  validateUpdateTaskPayload,
} from '../../src/utils/validation/task.validator.ts';

describe('task payload validation', () => {
  it('normalizes a valid create payload', () => {
    const payload = validateCreateTaskPayload({
      title: '  Implement login  ',
      description: '  Add JWT support  ',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2026-08-01T00:00:00.000Z',
    });

    expect(payload).toEqual({
      title: 'Implement login',
      description: 'Add JWT support',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date('2026-08-01T00:00:00.000Z'),
    });
  });

  it('rejects an empty title', () => {
    expect(() => validateCreateTaskPayload({ title: '   ' })).toThrow(
      'Title is required',
    );
  });

  it('rejects an invalid status', () => {
    expect(() =>
      validateUpdateTaskPayload({ status: 'blocked' }),
    ).toThrow('Invalid status');
  });
});
