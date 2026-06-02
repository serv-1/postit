import {
  ID_REGEX,
  NAME_REGEX,
  POST_PAGE_REGEX,
  POST_UPDATE_PAGE_REGEX,
  USER_PAGE_REGEX,
} from '.'

describe('ID_REGEX', () => {
  const regex = new RegExp('^' + ID_REGEX.source + '$')

  it('matches a valid id', () => {
    expect('a0b1c2d3e4f5678900000000').toMatch(regex)
  })

  it("doesn't match if the id is too short", () => {
    expect('0').not.toMatch(regex)
  })

  it("doesn't match if the id is too long", () => {
    expect('a0b1c2d3e4f56789000000001').not.toMatch(regex)
  })

  it("doesn't match if the id isn't hexadecimal", () => {
    expect('a0b1c2d3e4f567890000000g').not.toMatch(regex)
  })
})

describe('NAME_REGEX', () => {
  const regex = new RegExp('^' + NAME_REGEX.source + '$', 'u')

  it('matches a valid name', () => {
    expect('blue-chair🪑😵‍💫').toMatch(regex)
  })

  it("doesn't match if the name is too short", () => {
    expect('').not.toMatch(regex)
  })

  it("doesn't match if the name is too long", () => {
    expect('a'.repeat(91)).not.toMatch(regex)
  })

  it("doesn't match if the name contains non-word characters", () => {
    expect('ch@ir').not.toMatch(regex)
  })
})

describe('POST_PAGE_REGEX', () => {
  it('matches a valid path', () => {
    expect('/posts/a0b1c2d3e4f5678900000000/blue-chair🪑').toMatch(
      POST_PAGE_REGEX,
    )
  })

  it("doesn't match if the path is invalid", () => {
    expect('/').not.toMatch(POST_PAGE_REGEX)
  })
})

describe('POST_UPDATE_PAGE_REGEX', () => {
  it('matches a valid path', () => {
    expect('/posts/a0b1c2d3e4f5678900000000/blue-chair🪑/update').toMatch(
      POST_UPDATE_PAGE_REGEX,
    )
  })

  it("doesn't match if the path is invalid", () => {
    expect('/').not.toMatch(POST_UPDATE_PAGE_REGEX)
  })
})

describe('USER_PAGE_REGEX', () => {
  it('matches a valid path', () => {
    expect('/users/a0b1c2d3e4f5678900000000/john-doe😎👨🏻‍💻').toMatch(
      USER_PAGE_REGEX,
    )
  })

  it("doesn't match if the path is invalid", () => {
    expect('/').not.toMatch(USER_PAGE_REGEX)
  })
})
