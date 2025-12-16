import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Test only helper function.
 *
 * Setup user-event and render the given JSX element.
 */
export default function setup(jsx: React.JSX.Element) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  }
}
