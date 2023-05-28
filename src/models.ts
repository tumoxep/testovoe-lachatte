export interface ContactListItem {
  id: number
  hash: string
  firstName: string
  lastName: string
  phone: string
  email: string
}

export interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}
