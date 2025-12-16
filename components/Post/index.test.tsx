import Post from '.'
import { screen } from '@testing-library/react'
import setup from 'functions/setup'

it('formats the post name to url in the link href', () => {
  setup(<Post id="0" name="blue book" price={10} image="" address="" />)

  const link = screen.getByRole('link')
  expect(link).toHaveAttribute('href', '/posts/0/blue-book')
})

it('adds spaces to the price number', () => {
  setup(<Post id="" name="" price={5000} image="" address="" />)

  const price = screen.getByText(/5 000/)
  expect(price).toBeInTheDocument()
})
