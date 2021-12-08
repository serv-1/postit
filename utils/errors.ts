/* Email */
export const emailRequired = 'The email is required.'
export const emailInvalid = 'The email is invalid.'
export const emailUsed = 'The email is already used.'
/* Username */
export const usernameRequired = 'The username is required.'
export const usernameInvalid = 'The username is invalid.'
export const usernameMax = 'The username cannot exceed 90 characters.'
/* Password */
export const passwordInvalid = 'The password is invalid.'
export const passwordRequired = 'The password is required.'
export const passwordMin = 'The password must have 10 characters.'
export const passwordMax = 'The password cannot exceed 20 characters.'
export const passwordEmail = 'The password cannot be the same as the email.'
/* Data */
export const dataInvalid = 'The given data are invalid.'
/* Server */
export const internalServerError = 'Server go boom! Try to refresh the page or come back later.'
export const methodNotAllowed = 'Request go boom! Try to refresh the page or retry your action.'

const errors = {
  emailRequired,
  emailInvalid,
  usernameRequired,
  usernameInvalid,
  usernameMax,
  passwordInvalid,
  passwordRequired,
  passwordMin,
  passwordMax,
  passwordEmail,
  dataInvalid,
}

export default errors
