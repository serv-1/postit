import err from '../../../utils/constants/errors'

const url = '/api/user'

describe('/api/user', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
  })

  it('405 - Method not allowed', function () {
    cy.req({ url, method: 'PATCH' }).then((res) => {
      expect(res.status).to.eq(405)
      expect(res.body).to.have.property('message', err.METHOD_NOT_ALLOWED)
    })
  })

  describe('POST', () => {
    const method = 'POST'

    it('422 - Invalid request body', function () {
      cy.req({ url, method }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message')
        expect(res.body).to.have.property('name')
      })
    })

    it('422 - Email already used', function () {
      cy.task('db:seed')
      const { name, email, password } = this.user
      cy.req({ url, method, body: { name, email, password } }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.property('message', err.EMAIL_USED)
        expect(res.body).to.have.property('name', 'email')
      })
    })

    it('200 - User created', function () {
      const { name, email, password } = this.user
      cy.req({ url, method, body: { name, email, password } }).then((res) => {
        expect(res.status).to.eq(200)
      })
    })
  })
})
