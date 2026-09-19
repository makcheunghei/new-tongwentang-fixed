import type { ZodType } from 'zod';

export const vldFn = (schema: ZodType<unknown>) => (data: unknown) => schema.safeParse(data).success;
