import {
  ID_REGEX,
  NAME_REGEX,
  POST_PAGE_REGEX,
  POST_UPDATE_PAGE_REGEX,
} from '.'

describe('ID_REGEX', () => {
  it('matches a valid id', () => {
    expect(ID_REGEX.test('a0b1c2d3e4f5678900000000')).toBe(true)
  })

  it("doesn't match if the id is too short", () => {
    expect(ID_REGEX.test('0')).toBe(false)
  })

  it("doesn't match if the id is too long", () => {
    expect(
      new RegExp('^' + ID_REGEX.source + '$').test('a0b1c2d3e4f56789000000001')
    ).toBe(false)
  })

  it("doesn't match if the id isn't hexadecimal", () => {
    expect(ID_REGEX.test('a0b1c2d3e4f567890000000g')).toBe(false)
  })
})

describe('NAME_REGEX', () => {
  it('matches a valid name', () => {
    expect(NAME_REGEX.test('chair🪑')).toBe(true)
  })

  it("doesn't match if the name is too short", () => {
    expect(NAME_REGEX.test('')).toBe(false)
  })

  it("doesn't match if the name is too long", () => {
    expect(new RegExp('^' + NAME_REGEX.source + '$').test('a'.repeat(91))).toBe(
      false
    )
  })

  it("doesn't match if the name contains non-word characters", () => {
    expect(new RegExp('^' + NAME_REGEX.source + '$').test('ch@ir🪑')).toBe(
      false
    )
  })
})

describe('POST_PAGE_REGEX', () => {
  it('matches a valid path', () => {
    expect(
      POST_PAGE_REGEX.test('/posts/a0b1c2d3e4f5678900000000/chair🪑')
    ).toBe(true)
  })

  it("doesn't match the path is invalid", () => {
    expect(POST_PAGE_REGEX.test('/'))
  })
})

describe('POST_UPDATE_PAGE_REGEX', () => {
  it('matches a valid path', () => {
    expect(
      POST_UPDATE_PAGE_REGEX.test(
        '/posts/a0b1c2d3e4f5678900000000/chair🪑/update'
      )
    ).toBe(true)
  })

  it("doesn't match the path is invalid", () => {
    expect(POST_UPDATE_PAGE_REGEX.test('/')).toBe(false)
  })
})
