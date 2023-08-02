export const mockServerPusherTrigger = jest.fn()

export default function getServerPusher() {
  return {
    trigger: mockServerPusherTrigger,
  }
}
