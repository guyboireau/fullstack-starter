import { describe, it, expect } from 'vitest';
import {
  itemStatusSchema,
  itemFormSchema,
  itemSchema,
} from './item';

// ---------------------------------------------------------------------------
// itemStatusSchema
// ---------------------------------------------------------------------------
describe('itemStatusSchema', () => {
  it.each(['todo', 'in_progress', 'done'] as const)(
    'accepts valid status "%s"',
    (status) => {
      expect(itemStatusSchema.parse(status)).toBe(status);
    },
  );

  it('rejects an unknown status', () => {
    expect(() => itemStatusSchema.parse('pending')).toThrow();
  });

  it('rejects empty string', () => {
    expect(() => itemStatusSchema.parse('')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// itemFormSchema
// ---------------------------------------------------------------------------
describe('itemFormSchema', () => {
  it('parses a minimal valid object (title only)', () => {
    const result = itemFormSchema.parse({ title: 'My task' });
    expect(result.title).toBe('My task');
    expect(result.status).toBe('todo'); // default
    expect(result.description).toBeUndefined();
  });

  it('parses a fully-populated object', () => {
    const input = { title: 'Full task', description: 'A description', status: 'in_progress' };
    const result = itemFormSchema.parse(input);
    expect(result).toEqual({ title: 'Full task', description: 'A description', status: 'in_progress' });
  });

  it('rejects an empty title', () => {
    expect(() => itemFormSchema.parse({ title: '' })).toThrow();
  });

  it('rejects when title is missing', () => {
    expect(() => itemFormSchema.parse({ status: 'todo' })).toThrow();
  });

  it('rejects a title longer than 200 characters', () => {
    expect(() => itemFormSchema.parse({ title: 'a'.repeat(201) })).toThrow();
  });

  it('accepts a title of exactly 200 characters', () => {
    const result = itemFormSchema.parse({ title: 'a'.repeat(200) });
    expect(result.title).toHaveLength(200);
  });

  it('rejects a description longer than 1000 characters', () => {
    expect(() =>
      itemFormSchema.parse({ title: 'ok', description: 'x'.repeat(1001) }),
    ).toThrow();
  });

  it('accepts a description of exactly 1000 characters', () => {
    const result = itemFormSchema.parse({ title: 'ok', description: 'x'.repeat(1000) });
    expect(result.description).toHaveLength(1000);
  });

  it('rejects an invalid status value', () => {
    expect(() => itemFormSchema.parse({ title: 'ok', status: 'invalid' })).toThrow();
  });

  it('applies the default status "todo" when status is omitted', () => {
    const result = itemFormSchema.parse({ title: 'task' });
    expect(result.status).toBe('todo');
  });
});

// ---------------------------------------------------------------------------
// itemSchema (extends itemFormSchema)
// ---------------------------------------------------------------------------
describe('itemSchema', () => {
  const validItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Full item',
    description: 'Desc',
    status: 'done' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  };

  it('parses a complete valid item', () => {
    const result = itemSchema.parse(validItem);
    expect(result).toEqual(validItem);
  });

  it('accepts null for updated_at', () => {
    const result = itemSchema.parse({ ...validItem, updated_at: null });
    expect(result.updated_at).toBeNull();
  });

  it('rejects a non-UUID id', () => {
    expect(() => itemSchema.parse({ ...validItem, id: 'not-a-uuid' })).toThrow();
  });

  it('rejects a non-UUID user_id', () => {
    expect(() => itemSchema.parse({ ...validItem, user_id: 'not-a-uuid' })).toThrow();
  });

  it('rejects when id is missing', () => {
    const { id: _id, ...rest } = validItem;
    expect(() => itemSchema.parse(rest)).toThrow();
  });

  it('rejects when user_id is missing', () => {
    const { user_id: _uid, ...rest } = validItem;
    expect(() => itemSchema.parse(rest)).toThrow();
  });

  it('rejects when created_at is missing', () => {
    const { created_at: _cat, ...rest } = validItem;
    expect(() => itemSchema.parse(rest)).toThrow();
  });

  it('still enforces title min-length from itemFormSchema', () => {
    expect(() => itemSchema.parse({ ...validItem, title: '' })).toThrow();
  });
});
