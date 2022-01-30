const err = {
	/* Email */
	EMAIL_REQUIRED: 'The email is required.' as const,
  EMAIL_INVALID: 'The email is invalid.' as const,
	EMAIL_USED: 'The email is already used.' as const,
	EMAIL_UNKNOWN: 'The email is not registered.' as const,
	EMAIL_GOOGLE: 'The email is linked to a Google account. (sign in with Google)' as const,
	/* Name */
  NAME_REQUIRED: 'The name is required.' as const,
  NAME_INVALID: 'The name is invalid.' as const,
  NAME_MAX: 'The name cannot exceed 90 characters.' as const,
	/* Password */
  PASSWORD_INVALID: 'The password is invalid.' as const,
  PASSWORD_REQUIRED: 'The password is required.' as const,
  PASSWORD_MIN: 'The password must have 10 characters.' as const,
  PASSWORD_MAX: 'The password cannot exceed 20 characters.' as const,
  PASSWORD_SAME: 'The password cannot be the same as the other fields\' value.' as const,
	/* User image */
	IMAGE_INVALID: 'An image is expected. (.jpeg, .jpg, .png, .gif)' as const,
	IMAGE_TOO_LARGE: 'The image\'s size cannot exceed 1 megabyte.' as const,
	IMAGE_REQUIRED: 'The image is required.' as const,
	/* Description */
	DESCRIPTION_INVALID: 'The description is invalid.' as const,
	DESCRIPTION_REQUIRED: 'The description is required.' as const,
	DESCRIPTION_MIN: 'The description must have 10 characters.' as const,
	DESCRIPTION_MAX: 'The description cannot exceed 300 characters.' as const,
	/* Categories */
	CATEGORIES_INVALID: 'One or many categories are invalid.' as const,
	CATEGORIES_REQUIRED: 'At least one category is required.' as const,
	CATEGORIES_MAX: 'Only 3 categories are allowed per posts.' as const,
	/* Category */
	CATEGORY_INVALID: 'A category is invalid.' as const,
	/* Price */
	PRICE_INVALID: 'The price is invalid.' as const,
	PRICE_REQUIRED: 'The price is required.' as const,
	MAX_PRICE_MIN: 'The maximum price must be greater than the minimum price.' as const,
	/* Images */
	IMAGES_INVALID: 'One or many images are invalid.' as const,
	IMAGES_REQUIRED: 'At least one image is required.' as const,
	IMAGES_MAX: 'Only 5 images are allowed per posts.' as const,
	/* Page */
	PAGE_INVALID: 'The page is invalid.' as const,
	/* Query */
	QUERY_INVALID: 'Your query is invalid.' as const,
	QUERY_REQUIRED: 'You must express a query.' as const,
	QUERY_MAX: 'Your query cannot exceed 90 characters.' as const,
	/* Data */
  DATA_INVALID: 'The given data are invalid.' as const,
	/* Server */
	PARAMS_INVALID: 'One or many parameters are invalid.' as const,
	DEFAULT_SERVER_ERROR: 'Something go boom! Be sure to have read the rules (if any) before sending your request again.' as const,
	INTERNAL_SERVER_ERROR: 'Server go boom! Try to refresh the page or come back later.' as const,
	METHOD_NOT_ALLOWED: 'Request go boom! This method is not handled.' as const,
	FORBIDDEN: 'You are not authorized.' as const,
	NO_RESPONSE: 'The server didn\'t respond.' as const,
	/* Resource Not Found */
	USER_NOT_FOUND: 'User not found.' as const,
	IMAGE_NOT_FOUND: 'Image not found.' as const,
	/* csrf token */
	CSRF_TOKEN_INVALID: 'Something weird happen! Try to refresh the page or sign out and sign in again.' as const
}

export default err
