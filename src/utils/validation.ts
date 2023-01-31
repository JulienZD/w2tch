import { z } from 'zod';

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isPrimitive = (value: unknown): value is string | number | boolean | null | undefined => {
  return value === null || value === undefined || (typeof value !== 'object' && typeof value !== 'function');
};

export const zPrimitive = z.union([z.string(), z.number(), z.boolean()]);

export const zStringifiedJson = z.preprocess((v) => {
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch (err) {
    return v;
  }
}, z.record(z.any()));
