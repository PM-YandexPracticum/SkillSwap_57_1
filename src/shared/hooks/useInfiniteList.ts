import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** Порция карточек по умолчанию для каталога (см. #175) */
export const DEFAULT_PAGE_SIZE = 6

export type UseInfiniteListOptions = {
  /** Сколько элементов показывать за раз. По умолчанию DEFAULT_PAGE_SIZE */
  pageSize?: number
  /**
   * Ключ сброса. При изменении значения счётчик видимых элементов
   * возвращается к pageSize, а observer пересоздаётся.
   * Удобно передавать «сериализованное» состояние фильтров/сортировки.
   */
  resetKey?: unknown
  /** Отступ, за которым observer считает sentinel видимым (по умолчанию 200px) */
  rootMargin?: string
}

export type UseInfiniteListResult<T> = {
  /** Видимый срез элементов */
  visibleItems: T[]
  /** true, если есть ещё элементы, которые не показаны */
  hasMore: boolean
  /** ref-callback: повесить на пустой div под списком */
  sentinelRef: (node: HTMLElement | null) => void
}

/**
 * Возвращает видимый срез массива и догружает по pageSize,
 * когда sentinel попадает в зону видимости.
 *
 * Особенности:
 * - при смене resetKey счётчик сбрасывается к pageSize (AC «список начинается сначала»);
 * - при достижении конца массива observer отключается (AC «догрузка останавливается»);
 * - количество уже видимых элементов хранится в state и не откатывается при ререндере.
 */
export function useInfiniteList<T>(
  items: T[],
  { pageSize = DEFAULT_PAGE_SIZE, resetKey, rootMargin = '200px' }: UseInfiniteListOptions = {},
): UseInfiniteListResult<T> {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null)

  // Храним актуальную длину items в ref: колбэк observer не должен зависеть от неё,
  // иначе при каждом изменении длины observer будет пересоздаваться.
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

  useEffect(() => {
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) =>
            Math.min(count + pageSize, itemsLengthRef.current),
          )
        }
      },
      { rootMargin },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinel, hasMore, pageSize, rootMargin])

  const sentinelRef = useCallback((node: HTMLElement | null) => {
    setSentinel(node)
  }, [])

  return { visibleItems, hasMore, sentinelRef }
}
