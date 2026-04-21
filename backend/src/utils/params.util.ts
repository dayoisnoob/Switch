import { ApiError } from './api-response';

export const getParam = (
  value: string | string[] | undefined,
  name: string
): string => {
  if (!value || Array.isArray(value)) {
    throw new ApiError(400, `Missing required parameter: ${name}`);
  }
  return value;
};
