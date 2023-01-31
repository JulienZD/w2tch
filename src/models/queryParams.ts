import { z } from 'zod';
import { zStringifiedJson, zPrimitive } from '~/utils/validation';

export const zQueryParam = z.union([zStringifiedJson, zPrimitive.array(), zPrimitive]).optional();

export const zQueryParams = z.record(zQueryParam);
