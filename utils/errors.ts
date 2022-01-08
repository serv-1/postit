const err = {
	/* Email */
	EMAIL_REQUIRED: 'The email is required.',
  EMAIL_INVALID: 'The email is invalid.',
	EMAIL_USED: 'The email is already used.',
	EMAIL_UNKNOWN: 'The email is not registered.',
	EMAIL_GOOGLE: 'The email is linked to a Google account. (sign in with Google)',
	/* Name */
  NAME_REQUIRED: 'The name is required.',
  NAME_INVALID: 'The name is invalid.',
  NAME_MAX: 'The name cannot exceed 90 characters.',
	/* Password */
  PASSWORD_INVALID: 'The password is invalid.',
  PASSWORD_REQUIRED: 'The password is required.',
  PASSWORD_MIN: 'The password must have 10 characters.',
  PASSWORD_MAX: 'The password cannot exceed 20 characters.',
  PASSWORD_SAME: 'The password cannot be the same as the other fields\' value.',
	/* User Image */
	USER_IMAGE_INVALID: 'An image is expected. (.jpeg, .jpg, .png, .gif)',
	USER_IMAGE_TOO_LARGE: 'The image size cannot exceed 1 megabytes.',
	/* Data */
  DATA_INVALID: 'The given data are invalid.',
	/* Server */
	PARAMS_INVALID: 'One or many parameters are invalid.',
	DEFAULT_SERVER_ERROR: 'Something go boom! Be sure to have read the rules (if any) before sending your request again.',
	INTERNAL_SERVER_ERROR: 'Server go boom! Try to refresh the page or come back later.',
	METHOD_NOT_ALLOWED: 'Request go boom! This method is not handled.',
	FORBIDDEN: 'You are not authorized.',
	NO_RESPONSE: 'The server didn\'t respond.',
	/* Resource Not Found */
	USER_NOT_FOUND: 'User not found.',
	IMAGE_NOT_FOUND: 'Image not found.'
}

export default err
