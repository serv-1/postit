// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

///<reference types="cypress" />

export interface ReqParams extends Partial<Cypress.RequestOptions> {
  csrfToken?: boolean
}

declare global {
  namespace Cypress {
    interface Chainable {
      signIn(email: string, password: string): void
      req<T extends unknown>(options?: ReqParams): Chainable<Response<T>>
    }
  }
}
