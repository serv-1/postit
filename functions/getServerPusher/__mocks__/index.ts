export const mockServerPusherTrigger = jest.fn()
export const mockServerPusherTriggerBatch = jest.fn()

export default function getServerPusher() {
  return {
    trigger: mockServerPusherTrigger,
    triggerBatch: mockServerPusherTriggerBatch,
  }
}
