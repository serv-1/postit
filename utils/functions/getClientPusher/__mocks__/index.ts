export const mockClientPusherBind = jest.fn()
export const mockClientPusherUnbind = jest.fn()

export default function getClientPusher() {
  return {
    subscribe: () => ({
      bind: mockClientPusherBind,
      unbind: mockClientPusherUnbind,
    }),
  }
}
