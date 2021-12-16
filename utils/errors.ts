/* Email */
export const EMAIL_REQUIRED = 'The email is required.'
export const EMAIL_INVALID = 'The email is invalid.'
export const EMAIL_USED = 'The email is already used.'
export const EMAIL_UNKNOWN = 'The email is not registered.'
export const EMAIL_GOOGLE = 'The email is linked to a Google account. (sign in with Google)'
/* Name */
export const NAME_REQUIRED = 'The name is required.'
export const NAME_INVALID = 'The name is invalid.'
export const NAME_MAX = 'The name cannot exceed 90 characters.'
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
	EMAIL_UNKNOWN,
	EMAIL_GOOGLE,
  NAME_REQUIRED,
  NAME_INVALID,
  NAME_MAX,
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
