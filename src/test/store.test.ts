// stores/counter.spec.ts
import { setActivePinia, createPinia } from 'pinia'
import { useContactsStore } from '@/store'
import { ContactListItem } from '@/models'

const contactMock: ContactListItem = {
  firstName: 'Mock',
  lastName: 'Mockov',
  phone: '+78005553535',
  email: 'mock.mockov@gmail.com',
  id: -1,
  hash: '',
}

describe('Contact Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('add/update/delete contact', () => {
    const contacts = useContactsStore()
    const contact = Object.assign({}, contactMock)
    let expectedHash = btoa(encodeURIComponent(`${contact.firstName},${contact.lastName},${contact.phone},${contact.email}`))
    
    expect(contacts.contacts).toHaveLength(0)
    contacts.addNewContact(contact)
    expect(contacts.contacts).toHaveLength(1)
    expect(contacts.contacts[0].id).toBe(0)
    expect(contacts.contacts[0].hash).toBe(expectedHash)

    contact.firstName = 'Remock'
    expectedHash = btoa(encodeURIComponent(`${contact.firstName},${contact.lastName},${contact.phone},${contact.email}`))
    contacts.updateContact(contact)
    expect(contacts.contacts).toHaveLength(1)
    expect(contacts.contacts[0].hash).toBe(expectedHash)

    contacts.deleteContact(contact)
    expect(contacts.contacts).toHaveLength(0)
  })
})