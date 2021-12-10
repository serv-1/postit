/* Email */
export const EMAIL_REQUIRED = 'The email is required.'
export const EMAIL_INVALID = 'The email is invalid.'
export const EMAIL_USED = 'The email is already used.'
/* Username */
export const USERNAME_REQUIRED = 'The username is required.'
export const USERNAME_INVALID = 'The username is invalid.'
export const USERNAME_MAX = 'The username cannot exceed 90 characters.'
/* Password */
export const PASSWORD_INVALID = 'The password is invalid.'
export const PASSWORD_REQUIRED = 'The password is required.'
export const PASSWORD_MIN = 'The password must have 10 characters.'
export const PASSWORD_MAX = 'The password cannot exceed 20 characters.'
export const PASSWORD_SAME = 'The password cannot be the same as the other fields\' values.'
/* Data */
export const DATA_INVALID = 'The given data are invalid.'
/* Server */
export const INTERNAL_SERVER_ERROR = 'Server go boom! Try to refresh the page or come back later.'
export const METHOD_NOT_ALLOWED = 'Request go boom! Try to refresh the page or retry your action.'

const errors = {
  EMAIL_REQUIRED,
  EMAIL_INVALID,
	EMAIL_USED,
  USERNAME_REQUIRED,
  USERNAME_INVALID,
  USERNAME_MAX,
  PASSWORD_INVALID,
  PASSWORD_REQUIRED,
  PASSWORD_MIN,
  PASSWORD_MAX,
  PASSWORD_SAME,
  DATA_INVALID,
	INTERNAL_SERVER_ERROR,
	METHOD_NOT_ALLOWED
}

export default errors
