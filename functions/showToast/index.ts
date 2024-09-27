import type { ShowToastEventData } from 'types/customEvent'

export default function showToast(detail: ShowToastEventData) {
  document.dispatchEvent(new CustomEvent('showToast', { detail }))
}
