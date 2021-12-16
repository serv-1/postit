type User = {
  name: string
  email: string
  password: string
}

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
