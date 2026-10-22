import type { Gender, TCategoryId } from '@/shared/types'

export type RegistrationProfileDraft = {
  name: string
  birthDate: string
  gender: Gender | ''
  cityId: string
  categoryId: TCategoryId | ''
  subcategoryId: string
  avatarFile: File | null
}

export type RegistrationSkillDraft = {
  title: string
  categoryId: string
  subcategoryId: string
  description: string
  images: File[]
}

export type RegistrationDraft = {
  step: 1 | 2 | 3
  account: { email: string; password: string }
  profile: RegistrationProfileDraft
  skill: RegistrationSkillDraft
}

const DRAFT_ID_KEY = 'skillswap.registrationDraft.id.v1'
const PASSWORD_KEY = 'skillswap.registrationDraft.password.v1'
const DATABASE = 'skillswap-registration-drafts'
const STORE = 'drafts'
const MAX_AGE = 24 * 60 * 60 * 1000

export function createEmptyRegistrationDraft(): RegistrationDraft {
  return {
    step: 1,
    account: { email: '', password: '' },
    profile: {
      name: '',
      birthDate: '',
      gender: '',
      cityId: '',
      categoryId: '',
      subcategoryId: '',
      avatarFile: null,
    },
    skill: { title: '', categoryId: '', subcategoryId: '', description: '', images: [] },
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let blocked = false
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => {
      if (blocked) request.result.close()
      else resolve(request.result)
    }
    request.onerror = () => reject(request.error)
    request.onblocked = () => {
      blocked = true
      reject(new Error('Хранилище черновиков занято'))
    }
  })
}

async function transaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = database.transaction(STORE, mode)
      const request = run(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(request.result)
      tx.onabort = () => reject(tx.error ?? new Error('Черновик не сохранён'))
      tx.onerror = () => reject(tx.error ?? request.error)
    })
  } finally {
    database.close()
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function hasStrings(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => typeof value[key] === 'string')
}

function isDraft(value: unknown): value is RegistrationDraft {
  if (!isObject(value) || (value.step !== 1 && value.step !== 2 && value.step !== 3)) return false
  const { account, profile, skill } = value
  return (
    isObject(account) &&
    hasStrings(account, ['email', 'password']) &&
    isObject(profile) &&
    hasStrings(profile, ['name', 'birthDate', 'gender', 'cityId', 'categoryId', 'subcategoryId']) &&
    ['', 'male', 'female', 'unspecified'].includes(String(profile.gender)) &&
    ['', 'business', 'creative', 'languages', 'education', 'health', 'home'].includes(
      String(profile.categoryId),
    ) &&
    (profile.avatarFile === null || profile.avatarFile instanceof File) &&
    isObject(skill) &&
    hasStrings(skill, ['title', 'categoryId', 'subcategoryId', 'description']) &&
    Array.isArray(skill.images) &&
    skill.images.every((file) => file instanceof File)
  )
}

// Операции выполняются по очереди: более старое сохранение не затрёт новое,
// а удаление после регистрации дождётся всех предыдущих записей.
let pending: Promise<unknown> = Promise.resolve()
function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const next = pending.then(operation)
  pending = next.catch(() => undefined)
  return next
}

export function readRegistrationDraft(): Promise<RegistrationDraft | null> {
  return enqueue(async () => {
    const id = sessionStorage.getItem(DRAFT_ID_KEY)
    // Удаляем оставшиеся после закрытия вкладок старые записи вместе с файлами.
    await transaction('readwrite', (store) => {
      const request = store.openCursor()
      request.onsuccess = () => {
        const cursor = request.result
        if (!cursor) return
        const value: unknown = cursor.value
        if (
          !isObject(value) ||
          typeof value.updatedAt !== 'number' ||
          Date.now() - value.updatedAt > MAX_AGE
        ) {
          cursor.delete()
        }
        cursor.continue()
      }
      return request
    })
    if (!id) return null
    const record: unknown = await transaction('readonly', (store) => store.get(id))
    if (!isObject(record) || !isDraft(record.draft)) {
      sessionStorage.removeItem(DRAFT_ID_KEY)
      sessionStorage.removeItem(PASSWORD_KEY)
      return null
    }
    const draft = record.draft
    draft.account.password = sessionStorage.getItem(PASSWORD_KEY) ?? ''
    // Если данные вкладки были очищены отдельно, остальные поля не пропадают.
    if (!draft.account.password) draft.step = 1
    return draft
  })
}

type PendingSave = {
  snapshot: RegistrationDraft
  password: string
  promise: Promise<void>
}
let queuedSave: PendingSave | null = null

export function saveRegistrationDraft(draft: RegistrationDraft): Promise<void> {
  // Только пароль живёт в sessionStorage и не попадает в постоянную базу.
  const snapshot = { ...draft, account: { email: draft.account.email, password: '' } }
  // Быстрый ввод объединяется в одну ожидающую запись, чтобы не копировать
  // все изображения отдельно для каждого набранного символа.
  if (queuedSave) {
    queuedSave.snapshot = snapshot
    queuedSave.password = draft.account.password
    return queuedSave.promise
  }
  const job: PendingSave = {
    snapshot,
    password: draft.account.password,
    promise: Promise.resolve(),
  }
  queuedSave = job
  job.promise = enqueue(async () => {
    queuedSave = null
    const id = sessionStorage.getItem(DRAFT_ID_KEY) ?? crypto.randomUUID()
    sessionStorage.setItem(DRAFT_ID_KEY, id)
    sessionStorage.setItem(PASSWORD_KEY, job.password)
    await transaction('readwrite', (store) =>
      store.put({ updatedAt: Date.now(), draft: job.snapshot }, id),
    )
  })
  return job.promise
}

export function clearRegistrationDraft(): Promise<void> {
  return enqueue(async () => {
    const id = sessionStorage.getItem(DRAFT_ID_KEY)
    sessionStorage.removeItem(DRAFT_ID_KEY)
    sessionStorage.removeItem(PASSWORD_KEY)
    if (id) await transaction('readwrite', (store) => store.delete(id))
  })
}
