import user from '../fixtures/user.json'
type User = typeof user

export function register(user: User) {
  cy.request({
    method: 'POST',
    url: '/api/users',
    body: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  })
}
