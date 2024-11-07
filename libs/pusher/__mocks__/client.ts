export const mockSubscribe = jest.fn()

const pusher = {
  subscribe: mockSubscribe,
}

export default pusher
