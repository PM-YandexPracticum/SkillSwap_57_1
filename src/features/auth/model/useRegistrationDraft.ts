import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clearRegistrationDraft,
  createEmptyRegistrationDraft,
  readRegistrationDraft,
  saveRegistrationDraft,
  type RegistrationDraft,
} from '../lib/registrationDraft'

function sameFields<T extends object>(left: T, right: T): boolean {
  return Object.keys(left).every((key) => Object.is(left[key as keyof T], right[key as keyof T]))
}

export function useRegistrationDraft() {
  const [draft, setDraft] = useState(createEmptyRegistrationDraft)
  const [isReady, setIsReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)
  const current = useRef(draft)
  const mounted = useRef(false)
  const enabled = useRef(true)
  const pending = useRef(0)
  const revision = useRef(0)

  useEffect(() => {
    mounted.current = true
    let cancelled = false
    void readRegistrationDraft()
      .then((saved) => {
        if (cancelled) return
        if (saved) {
          current.current = saved
          setDraft(saved)
        }
      })
      .catch(() => {
        if (!cancelled) setStorageError('Не удалось восстановить черновик регистрации.')
      })
      .finally(() => {
        if (!cancelled) setIsReady(true)
      })
    return () => {
      cancelled = true
      mounted.current = false
    }
  }, [])

  const updateDraft = useCallback((patch: Partial<RegistrationDraft>) => {
    if (!enabled.current) return
    const previous = current.current
    const next = { ...previous, ...patch }
    if (
      next.step === previous.step &&
      sameFields(next.account, previous.account) &&
      sameFields(next.profile, previous.profile) &&
      sameFields(next.skill, previous.skill)
    )
      return
    current.current = next
    setDraft(next)
    const version = ++revision.current
    pending.current += 1
    setIsSaving(true)
    void saveRegistrationDraft(next)
      .then(() => {
        if (mounted.current && version === revision.current) setStorageError(null)
      })
      .catch(() => {
        if (mounted.current && version === revision.current) {
          setStorageError(
            'Не удалось сохранить черновик. При обновлении страницы изменения могут потеряться.',
          )
        }
      })
      .finally(() => {
        pending.current -= 1
        if (mounted.current) setIsSaving(pending.current > 0)
      })
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!pending.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const clearDraft = useCallback(async () => {
    enabled.current = false
    try {
      await clearRegistrationDraft()
    } catch {
      // Аккаунт уже создан. Ошибка очистки не должна запускать регистрацию заново.
      // Старый черновик будет удалён по сроку хранения при следующем открытии.
      if (mounted.current) setStorageError('Регистрация завершена, но не удалось удалить черновик.')
    }
  }, [])

  return { draft, updateDraft, clearDraft, isReady, isSaving, storageError }
}
