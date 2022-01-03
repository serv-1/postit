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
export const PASSWORD_SAME = 'The password cannot be the same as the other fields\' value.'
/* User Image */
export const USER_IMAGE_INVALID = 'An image is expected. (.jpeg, .jpg, .png, .gif)'
export const USER_IMAGE_TOO_LARGE = 'The image size cannot exceed 1 megabytes.'
/* Data */
export const DATA_INVALID = 'The given data are invalid.'
/* Request */
export const PARAMS_INVALID = 'One or many parameters are invalid.'
/* Server */
export const DEFAULT_SERVER_ERROR = 'Something go boom! Be sure to have read the rules (if any) before sending your request again.'
export const INTERNAL_SERVER_ERROR = 'Server go boom! Try to refresh the page or come back later.'
export const METHOD_NOT_ALLOWED = 'Request go boom! This method is not handled.'
export const FORBIDDEN = 'You are not authorized.'
export const NO_RESPONSE = 'The server didn\'t respond.'
/* Resource Not Found */
export const USER_NOT_FOUND = 'User not found.'
export const IMAGE_NOT_FOUND = 'Image not found.'

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
	USER_IMAGE_INVALID,
	USER_IMAGE_TOO_LARGE,
  DATA_INVALID,
	PARAMS_INVALID,
	INTERNAL_SERVER_ERROR,
	METHOD_NOT_ALLOWED,
	FORBIDDEN,
	USER_NOT_FOUND,
	IMAGE_NOT_FOUND
}

export default errors
