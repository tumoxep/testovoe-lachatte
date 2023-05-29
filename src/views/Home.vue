<script setup lang="ts">
import Papa, { ParseLocalConfig, UnparseConfig } from 'papaparse'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { FormInstance } from 'ant-design-vue'
import { ContactListItem } from '@/models'
import { UploadOutlined } from '@ant-design/icons-vue'
import { useContactsStore } from '@/store'

const store = useContactsStore()
const { contacts } = storeToRefs(store)
const {
  addNewContact,
  deleteContact,
  updateContact,
  addImportedContacts,
} = store

const columns = [
  {
    title: 'Имя',
    dataIndex: 'firstName',
    key: 'firstName',
  },
  {
    title: 'Фамилия',
    dataIndex: 'lastName',
    key: 'lastName',
  },
]

const searchText = ref<string>('')
const filteredContacts = computed<ContactListItem[]>(() => {
  if (searchText.value === '') {
    return contacts.value
  }
  return contacts.value.filter(el => 
    `${el.firstName} ${el.lastName}`
      .toLocaleLowerCase()
      .includes(
        searchText.value.toLocaleLowerCase(),
      )
  )
})

const DEFAULT_FORM_STATE = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  id: -1,
  hash: '',
}

const formRef = ref<FormInstance>()
const formState = ref<ContactListItem>(DEFAULT_FORM_STATE)
const validateMessages = {
  required: 'Обязательное поле',
  types: {
    email: 'Некорректный email',
  },
}

const editContactModalVisible = ref<boolean>(false)

const showEditModal = ({}, contact: ContactListItem | undefined) => {
  formRef?.value?.resetFields()
  if (contact) {
    formState.value = Object.assign({}, contact)
  } else {
    formState.value = DEFAULT_FORM_STATE
  }
  editContactModalVisible.value = true
}

const onModalOk = async () => {
  const isEditMode = formState.value.id !== -1
  try {
    await formRef?.value?.validate()
    if (isEditMode) {
      updateContact(formState.value)
    } else {
      addNewContact(formState.value)
    }
    editContactModalVisible.value = false
  } catch (error) {
    console.log('error', error)
  }
}

const onFileUpload = (event: Event) => {
  const fileList = (event.target as HTMLInputElement).files
  if (!fileList) {
    return
  }
  const parseConfig: ParseLocalConfig = {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      addImportedContacts(results.data)
    }
  }
  for (const file of fileList) {
    Papa.parse(<any>file, parseConfig)
  }
}

const onExport = () => {
  const parseConfig: UnparseConfig = {
    columns: [
      'firstName',
      'lastName',
      'phone',
      'email',
    ],
  }
  const csv = Papa.unparse(contacts.value, parseConfig)
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv))
  element.setAttribute('download', 'export.csv')
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
</script>

<template>
  <a-space>
    <a-button @click="showEditModal">
      Новый контакт
    </a-button>
    <span>
      <label class="ant-btn" for="upload-file">
        <upload-outlined></upload-outlined>
        Импорт
      </label>
      <input
        type="file"
        accept="text/csv"
        name="file"
        id="upload-file"
        style="display:none"
        @change="onFileUpload"
      />
    </span>
    <a-button @click="onExport">
      Экспорт
    </a-button>
  </a-space>
  <a-input
    v-model:value="searchText"
    placeholder="Поиск"
  />
  <a-table
    :columns="columns"
    :data-source="filteredContacts"
    row-key="id"
    expand-row-by-click
  >
    <template #expandedRowRender="{ record }">
      <a-descriptions title="Контакты">
        <a-descriptions-item label="Телефон">{{ record.phone }}</a-descriptions-item>
        <a-descriptions-item label="Email">{{ record.email }}</a-descriptions-item>
      </a-descriptions>
      <a-space>
        <a-button @click="(e: MouseEvent) => showEditModal(e, record)">
          Редактировать
        </a-button>
        <a-button
          type="primary"
          danger
          @click="({}) => deleteContact(record)"
        >
          Удалить
        </a-button>
      </a-space>
    </template>
    <template #expandIcon></template>
  </a-table>
  <a-modal
    v-model:visible="editContactModalVisible"
    title="Новый контакт"
    @ok="onModalOk"
  >
    <a-form
      ref="formRef"
      name="edit-contact"
      :model="formState"
      :validate-messages="validateMessages"
    >
      <a-form-item
        name="firstName"
        label="Имя"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.firstName" />
      </a-form-item>
      <a-form-item
        name="lastName"
        label="Фамилия"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.lastName" />
      </a-form-item>
      <a-form-item
        name="phone"
        label="Телефон"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.phone" />
      </a-form-item>
      <a-form-item
        name="email"
        label="Email"
        :rules="[{ required: true, type: 'email' }]"
      >
        <a-input v-model:value="formState.email" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style>
.ant-table-thead th:first-child, .ant-table-row td:first-child {
  display: none;
}

.ant-table-row {
  cursor: pointer;
}
</style>
