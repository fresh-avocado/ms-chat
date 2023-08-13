export const stringifyError = (error: unknown): string => {
  return JSON.stringify(error, Object.getOwnPropertyNames(error));
};
