export const FORBIDDEN = {
  status: '403',
  code: 'FORBIDDEN',
  message: "Access denied! You don't have permission for this action!",
};
export const UNAUTHENTICATED = {
  status: '401',
  code: 'UNAUTHENTICATED',
  message: 'Access denied! You need to be authorized to perform this action!',
};
export const NOT_ACTIVATED = {
  status: '403',
  code: 'NOT_ACTIVATED',
  message: 'Unable to authorize this user!',
};
export const INTERNAL_SERVER_ERROR = {
  status: '500',
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Internal server error!',
};
export const DB_ERROR = {
  status: '500',
  code: 'DB_ERROR',
  message: 'Something went wrong!',
};
export const ACCOUNT_ALREADY_EXISTS = {
  status: '409',
  code: 'ACCOUNT_ALREADY_EXISTS',
  message: 'Account already exists!',
};
export const ACCOUNT_NOT_EXISTS = {
  status: '404',
  code: 'ACCOUNT_NOT_EXISTS',
  message: 'Account does not exist!',
};
export const ARGUMENT_VALIDATION_ERROR = {
  status: '400',
  code: 'BAD_USER_INPUT',
  message: 'Argument Validation Error',
};
export const FILE_MISSING = {
  status: '400',
  code: 'FILE_MISSING',
  message: 'File missing in the request.',
};
export const TOKEN_EXPIRED = {
  status: '401',
  code: 'TOKEN_EXPIRED',
  message: 'Token expired',
};
