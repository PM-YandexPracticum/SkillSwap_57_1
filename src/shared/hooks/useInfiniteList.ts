import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** Порция карточек по умолчанию для каталога (см. #175) */
export const DEFAULT_PAGE_SIZE = 6

/**
 * Задержка перед догрузкой. Данные у нас локальные, поэтому без неё
 * спиннер был бы незаметен — визуально догрузка выглядит «мгновенно».
 */
const LOAD_DELAY_MS = 400

export type UseInfiniteListOptions = {
  pageSize?: number
  resetKey?: unknown
  rootMargin?: string
}

export type UseInfiniteListResult<T> = {
  visibleItems: T[]
  hasMore: boolean
  sentinelRef: (node: HTMLElement | null) => void
}

/**
 * Возвращает видимый срез массива и догружает по pageSize,
 * когда sentinel попадает в зону видимости (с задержкой LOAD_DELAY_MS).
 *
 * Важно: observer включается только после первого скролла пользователя.
 * Иначе на высоком вьюпорте (и при rootMargin > 0) sentinel попадает
 * в зону пре-триггера сразу при монтировании, и каскад из
 * setTimeout'ов загружает все карточки без участия пользователя —
 * спиннер при этом не успевает быть замеченным.
 */
export function useInfiniteList<T>(
  items: T[],
  { pageSize = DEFAULT_PAGE_SIZE, resetKey, rootMargin = '200px' }: UseInfiniteListOptions = {},
): UseInfiniteListResult<T> {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null)
  const [hasScrolled, setHasScrolled] = useState(false)

  const itemsLengthRef = useRef(items.length)
  useEffect(() => {
    itemsLengthRef.current = items.length
  }, [items.length])

  // AC «После смены фильтров список начинается сначала».
  useEffect(() => {
    setVisibleCount(pageSize)
  }, [resetKey, pageSize])

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  )

  const hasMore = visibleCount < items.length

  // Ждём первый скролл пользователя — до него observer не включаем.
  useEffect(() => {
    if (hasScrolled) return

    const onScroll = () => setHasScrolled(true)
    window.addEventListener('scroll', onScroll, { once: true, passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [hasScrolled])

  useEffect(() => {
    if (!sentinel || !hasMore || !hasScrolled) return

    let timer: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        if (timer !== null) return

        timer = setTimeout(() => {
          timer = null
          setVisibleCount((count) =>
            Math.min(count + pageSize, itemsLengthRef.current),
          )
        }, LOAD_DELAY_MS)
      },
      { rootMargin },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
      if (timer !== null) clearTimeout(timer)
    }
  }, [sentinel, hasMore, hasScrolled, pageSize, rootMargin])

  const sentinelRef = useCallback((node: HTMLElement | null) => {
    setSentinel(node)
  }, [])

  return { visibleItems, hasMore, sentinelRef }
}
