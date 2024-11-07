export const mockMailjetPostRequest = jest.fn()

const mailjet = {
  post: () => ({
    request: mockMailjetPostRequest,
  }),
}

export default mailjet
