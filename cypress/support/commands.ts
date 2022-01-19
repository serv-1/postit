// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import { signIn } from 'next-auth/react'
import { ReqParams } from '.'

Cypress.Commands.add('signIn', async (email: string, password: string) => {
  const res = await signIn<'credentials'>('credentials', {
    email,
    password,
    redirect: false,
  })

  if (res && res.error) {
    throw new Error('[cy.signIn] error: ' + res.error)
  }
})

Cypress.Commands.add(
  'req',
  <T extends unknown>({
    method = 'GET',
    url = '/',
    body = {},
    failOnStatusCode = false,
    csrfToken = false,
  }: ReqParams) => {
    if (csrfToken) {
      cy.request('http://localhost:3000/api/auth/csrf').then((res) => {
        cy.wrap({ csrfToken: res.body.csrfToken, ...body }).as('body')
      })
    } else {
      cy.wrap(body).as('body')
    }

    return cy.get('@body').then((body) => {
      return cy
        .request<T>({ method, url, body, failOnStatusCode })
        .then((res) => res)
    })
  }
)
