export const optionalObject = <T extends Record<string, unknown>>(
  condition: boolean,
  obj: T
): T | Record<string, never> => (condition ? obj : ({} as T));
