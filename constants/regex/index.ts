export const ID_REGEX = /[a-f0-9]{24}/

export const NAME_REGEX = /[\w\p{Emoji}]{1,90}/

export const POST_PAGE_REGEX = new RegExp(
  '^/posts/' + ID_REGEX.source + '/' + NAME_REGEX.source + '$',
  'gu'
)

export const POST_UPDATE_PAGE_REGEX = new RegExp(
  '^/posts/' + ID_REGEX.source + '/' + NAME_REGEX.source + '/update$',
  'gu'
)

export const USER_PAGE_REGEX = new RegExp(
  '^/users/' + ID_REGEX.source + '/' + NAME_REGEX.source + '$',
  'gu'
)
