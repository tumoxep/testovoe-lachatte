import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ContactListItem } from '@/models'

export const useContactsStore = defineStore(
  'contacts', 
  () => {
    const contacts = ref<ContactListItem[]>([])

    function addNewContact(data: ContactListItem) {
      const id = Math.max(...[0, ...contacts.value.map(el => el.id)]) + 1
      const hash = btoa(encodeURIComponent(`${data.firstName},${data.lastName},${data.phone},${data.email}`))
      const contact = Object.assign({}, data, { id, hash })
      contacts.value = contacts.value.concat(contact)
    }

    function updateContact(data: ContactListItem) {
      const hash = btoa(encodeURIComponent(`${data.firstName},${data.lastName},${data.phone},${data.email}`))
      const contact = Object.assign({}, data, { hash })
      contacts.value.splice(
        contacts.value.findIndex(el => el.id === data.id),
        1,
        contact,
      )
    }

    function deleteContact(data: ContactListItem) {
      contacts.value.splice(contacts.value.findIndex(el => el.id === data.id), 1)
    }

    function addImportedContacts(data: any[]) {
      contacts.value = [
        ...contacts.value,
        ...data.reduce((acc: ContactListItem[], el, idx) => {
          if (!el.firstName || !el.lastName || !el.phone || !el.email) {
            return acc
          }
          el.hash = btoa(encodeURIComponent(`${el.firstName},${el.lastName},${el.phone},${el.email}`))
          if (contacts.value.find(contact => contact.hash === el.hash)) {
            return acc
          }
          el.id = Math.max(...[0, ...contacts.value.map(el => el.id)]) + 1 + idx
          return acc.concat(el)
        }, []),
      ]
    }

    return {
      contacts,
      addNewContact,
      updateContact,
      deleteContact,
      addImportedContacts,
    }
  },
  {
    persist: true,
  },
)
