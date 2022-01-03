import Profile from '../../pages/profile'
import { render, screen, waitFor } from '@testing-library/react'
import { mockSession } from '../../mocks/nextAuth'
import { SessionProvider } from 'next-auth/react'
import userEvent from '@testing-library/user-event'
import server from '../../mocks/server'
import { rest } from 'msw'
import {
  IMAGE_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  USER_IMAGE_INVALID,
  USER_IMAGE_TOO_LARGE,
} from '../../utils/errors'

const file = new File(['img'], 'img.jpeg', { type: 'image/jpeg' })

const reader = new FileReader()
let base64Uri: string
reader.onload = (e) => {
  base64Uri = e.target?.result as string
}
reader.readAsDataURL(file)

const factory = () => {
  render(
    <SessionProvider session={mockSession}>
      <Profile />
    </SessionProvider>
  )
}

describe('Profile', () => {
  describe('Image', () => {
    it('should render a server-side error', async () => {
      server.use(
        rest.put('http://localhost:3000/api/users/:id', (req, res, ctx) =>
          res(ctx.status(500), ctx.json({ message: INTERNAL_SERVER_ERROR }))
        )
      )
      factory()
      userEvent.upload(screen.getByTestId('fileInput'), file)
      expect(await screen.findByRole('alert')).toHaveTextContent(
        INTERNAL_SERVER_ERROR
      )
    })

    it('should not render errors if there is none', async () => {
      factory()
      await screen.findByRole('img')
      userEvent.upload(screen.getByTestId('fileInput'), file)
      await waitFor(() =>
        expect(screen.getByRole('img')).toHaveAttribute('src', base64Uri)
      )
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should render an error if the image cannot be obtained', async () => {
      server.use(
        rest.get('http://localhost:3000/api/users/:id', (req, res, ctx) =>
          res(ctx.status(404), ctx.json({ message: IMAGE_NOT_FOUND }))
        )
      )
      factory()
      expect(await screen.findByRole('alert')).toHaveTextContent(
        IMAGE_NOT_FOUND
      )
    })

    describe('image button', () => {
      it('should contain user image', async () => {
        factory()
        const img = mockSession.user.image
        expect(await screen.findByRole('img')).toHaveAttribute('src', img)
      })

      it('should trigger a click on the file input on click', async () => {
        factory()
        await screen.findByRole('img')
        const click = jest.fn()
        screen.getByTestId('fileInput').click = click
        userEvent.click(screen.getByRole('button'))
        expect(click).toHaveBeenCalledTimes(1)
      })

      it('should render the uploaded image', async () => {
        factory()
        await screen.findByRole('img')
        userEvent.upload(screen.getByTestId('fileInput'), file)
        await waitFor(() =>
          expect(screen.getByRole('img')).toHaveAttribute('src', base64Uri)
        )
      })
    })

    describe('file input', () => {
      it('should render an error if the file is not an image', async () => {
        factory()
        await screen.findByRole('img')
        const textFile = new File(['text'], 'text.txt', { type: 'text/plain' })
        userEvent.upload(screen.getByTestId('fileInput'), textFile)
        expect(await screen.findByRole('alert')).toHaveTextContent(
          USER_IMAGE_INVALID
        )
      })

      it('should render an error if the file is too large', async () => {
        factory()
        await screen.findByRole('img')
        const buffer = new ArrayBuffer(1000001)
        const f = new File([buffer], file.name, { type: file.type })
        userEvent.upload(screen.getByTestId('fileInput'), f)
        expect(await screen.findByRole('alert')).toHaveTextContent(
          USER_IMAGE_TOO_LARGE
        )
      })
    })
  })
})
