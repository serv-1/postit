function signup(user: { username: string; email: string; password: string }) {
  cy.request({
    method: 'POST',
    url: '/api/users',
    body: {
      username: user.username,
      email: user.email,
      password: user.password,
    },
  })
}

describe('/api/login', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.fixture('user').as('user')
  })

  context('POST', () => {
    it('422 - Email not registered', function () {
      cy.request({
        method: 'POST',
        url: '/api/login',
        body: {
          email: this.user.email,
          password: this.user.password,
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.ownProperty('message')
      })
    })

    it('422 - Password invalid', function () {
      signup(this.user)

      cy.request({
        url: '/api/login',
        method: 'POST',
        body: {
          email: this.user.email,
          password: 'wrong password',
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.ownProperty('message')
      })
    })

    it('422 - Joi validation error', () => {
      cy.request({
        method: 'POST',
        url: '/api/login',
        body: 'my mind tell noooo but my body, my body tell yeeees!',
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(422)
        expect(res.body).to.have.ownProperty('message')
      })
    })

    it('200 - Should log in a user', function () {
      signup(this.user)

      cy.request({
        method: 'POST',
        url: '/api/login',
        body: {
          email: this.user.email,
          password: this.user.password,
        },
      }).then((res) => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.ownProperty('id')
        expect(res.body).to.have.property('email', this.user.email)
      })
    })

    it('405 - Method not allowed', () => {
      cy.request({
        method: 'GET',
        url: '/api/login',
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(405)
        expect(res.body).to.have.ownProperty('message')
      })
    })
  })
})

export {}
