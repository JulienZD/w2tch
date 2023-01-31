import { isString } from './validation';

export const compareDates = <T extends { [P in K]?: Date | null }, K extends keyof T>(field: K, a: T, b: T): number => {
  const dateA = a[field];
  const dateB = b[field];

  if (!dateA && !dateB) {
    return 0;
  }

  let sortResult = 0;

  if (!dateA) {
    sortResult = -1;
  }

  if (!dateB) {
    sortResult = 1;
  }

  if (dateA && dateB) {
    sortResult = new Date(dateA).getTime() - new Date(dateB).getTime();
  }

  return sortResult;
};

export const compareNumberOrString = <T extends { [P in K]?: number | string }, K extends keyof T>(
  field: K,
  a: T,
  b: T
): number => {
  const valueA = a[field];
  const valueB = b[field];

  if (!valueA && !valueB) {
    return 0;
  }

  if (isString(valueA) && isString(valueB)) {
    return valueA.localeCompare(valueB);
  }

  return Number(valueA) - Number(valueB);
};
