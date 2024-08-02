import {Given, When, Then} from '@badeball/cypress-cucumber-preprocessor'

Given('I visit the site', () => {
  cy.visit('/')
})

Then('I see the title', () => {
  cy.get('h1').should('be.visible')
})

Then('I see 2 paragraphs', () => {
  cy.get('p').should('have.lengthOf', 2)
})