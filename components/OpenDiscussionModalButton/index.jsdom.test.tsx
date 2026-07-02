import { screen } from '@testing-library/react'
import OpenDiscussionModalButton from '.'
import { NEXT_PUBLIC_DEFAULT_USER_IMAGE } from 'env/public'
import setup from 'functions/setup'

vi.mock('next/image')

describe('if the interlocutor is null', () => {
  it('renders the default user image', () => {
    setup(
      <OpenDiscussionModalButton
        onClick={vi.fn()}
        postName="table"
        interlocutor={null}
      />,
    )

    const image = screen.getByRole('presentation')
    expect(image).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
  })

  it('renders the default user name', () => {
    setup(
      <OpenDiscussionModalButton
        onClick={vi.fn()}
        postName="table"
        interlocutor={null}
      />,
    )

    const name = screen.getByText(/deleted/i)
    expect(name).toBeInTheDocument()
  })
})

describe('if the interlocutor is not null', () => {
  it("renders the interlocutor's image", () => {
    setup(
      <OpenDiscussionModalButton
        onClick={vi.fn()}
        postName="table"
        interlocutor={{ name: 'john', image: 'john.jpeg' }}
      />,
    )

    const image = screen.getByRole('presentation')
    expect(image).toHaveAttribute('src', expect.stringContaining('john.jpeg'))
  })

  it('renders the default user image if the interlocutor has no image', () => {
    setup(
      <OpenDiscussionModalButton
        onClick={vi.fn()}
        postName="table"
        interlocutor={{ name: 'john' }}
      />,
    )

    const image = screen.getByRole('presentation')
    expect(image).toHaveAttribute('src', NEXT_PUBLIC_DEFAULT_USER_IMAGE)
  })

  it("renders the interlocutor's name", () => {
    setup(
      <OpenDiscussionModalButton
        onClick={vi.fn()}
        postName="table"
        interlocutor={{ name: 'john' }}
      />,
    )

    const name = screen.getByText('john')
    expect(name).toBeInTheDocument()
  })
})

it('does something on click', async () => {
  const onClick = vi.fn()
  const { user } = setup(
    <OpenDiscussionModalButton
      onClick={onClick}
      postName="table"
      interlocutor={null}
    />,
  )

  const button = screen.getByRole('button')
  await user.click(button)

  expect(onClick).toHaveBeenCalledOnce()
})
