const err = {
	/* Id */
	ID_INVALID: 'The id is invalid.' as const,
	/* Email */
	EMAIL_REQUIRED: 'The email is required.' as const,
  EMAIL_INVALID: 'The email is invalid.' as const,
	EMAIL_USED: 'The email is already used.' as const,
	EMAIL_UNKNOWN: 'The email is not registered.' as const,
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
	IMAGE_INVALID: 'An image is expected. (.jpeg (.jpg), .png, .gif)' as const,
	IMAGE_TOO_BIG: 'The image size cannot exceed 1 megabyte.' as const,
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
	/* Address */
	ADDRESS_INVALID: 'Your address is invalid.' as const,
	ADDRESS_REQUIRED: 'The address is required.' as const,
	ADDRESS_MAX: 'Your address cannot exceed 200 characters.' as const,
	/* LatLon */
	LATLON_INVALID: 'The latitude/longitude are invalid.' as const,
	LATLON_REQUIRED: 'The latitude/longitude are required.' as const,
	/* Message */
	MESSAGE_INVALID: 'The message is invalid.' as const,
	MESSAGE_REQUIRED: 'The message is required.' as const,
	MESSAGE_MAX: 'The message cannot exceed 500 characters.' as const,
	/* Created at */
	CREATED_AT_INVALID: 'The creation date is invalid.' as const,
	CREATED_AT_REQUIRED: 'The creation date is required.' as const,
	/* Channel name */
	CHANNEL_NAME_INVALID: 'The channel name is invalid.' as const,
	CHANNEL_NAME_REQUIRED: 'The channel name is required.' as const,
	CHANNEL_NAME_MAX: 'The channel name cannot exceed 146 characters.' as const,
	/* Object key name (AWS S3) */
	KEY_INVALID: 'The key is invalid.' as const,
	KEY_REQUIRED: 'The key is required.' as const,
	/* Data */
  DATA_INVALID: 'The given data are invalid.' as const,
	/* Server */
	PARAMS_INVALID: 'One or many parameters are invalid.' as const,
	INTERNAL_SERVER_ERROR: 'Something go wrong! Try to refresh the page or come back later.' as const,
	METHOD_NOT_ALLOWED: 'This method is not allowed.' as const,
	FORBIDDEN: 'You are not allowed.' as const,
	UNAUTHORIZED: 'You need to be signed in.' as const,
	NO_RESPONSE: 'The server didn\'t respond.' as const,
	/* Resource Not Found */
	USER_NOT_FOUND: 'User not found.' as const,
	IMAGE_NOT_FOUND: 'Image not found.' as const,
	POST_NOT_FOUND: 'Post not found.' as const,
	DISCUSSION_NOT_FOUND: 'Discussion not found.' as const,
	/* Resource already exists */
	DISCUSSION_ALREADY_EXISTS: 'You already have started a discussion for this post.' as const,
	/* csrf token */
	CSRF_TOKEN_INVALID: 'Something weird happened! Try to refresh the page or sign out and sign in again.' as const,
	/* Default */
	DEFAULT: 'Something go wrong! Try your action again or just wait if it still doesn\'t work.' as const,
	/* Misc */
	CANNOT_SEND_MSG: 'You cannot send a message because your interlocutor has deleted its account or the discussion.' as const,
}

export default err
