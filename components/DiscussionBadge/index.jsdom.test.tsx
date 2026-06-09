import setup from 'functions/setup'
import DiscussionBadge from '.'
import { screen } from '@testing-library/react'

it('is shown', () => {
  setup(<DiscussionBadge isShown />)

  const badge = screen.getByRole('status')
  expect(badge).toBeInTheDocument()
})

it('is not shown', () => {
  setup(<DiscussionBadge />)

  const badge = screen.queryByRole('status')
  expect(badge).not.toBeInTheDocument()
})
