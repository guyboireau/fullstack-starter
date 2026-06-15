import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateItemDto } from './create-item.dto';

async function validateDto(plain: object) {
  const instance = plainToInstance(CreateItemDto, plain);
  return validate(instance);
}

describe('CreateItemDto', () => {
  it('passes with a valid title', async () => {
    const errors = await validateDto({ title: 'My task' });
    expect(errors).toHaveLength(0);
  });

  it('fails when title is empty', async () => {
    const errors = await validateDto({ title: '' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('fails when title is missing', async () => {
    const errors = await validateDto({});
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('trims whitespace from title via Transform', async () => {
    const instance = plainToInstance(CreateItemDto, { title: '  padded  ' });
    expect(instance.title).toBe('padded');
  });

  it('accepts valid status values', async () => {
    for (const status of ['todo', 'in_progress', 'done']) {
      const errors = await validateDto({ title: 'x', status });
      expect(errors).toHaveLength(0);
    }
  });

  it('rejects an invalid status', async () => {
    const errors = await validateDto({ title: 'x', status: 'invalid' });
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('accepts optional description', async () => {
    const errors = await validateDto({ title: 'x', description: 'some text' });
    expect(errors).toHaveLength(0);
  });
});
