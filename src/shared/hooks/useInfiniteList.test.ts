import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PAGE_SIZE, useInfiniteList } from './useInfiniteList'

const makeItems = (count: number) => Array.from({ length: count }, (_, id) => ({ id }))

/**
 * Мок IntersectionObserver: складывает инстансы в статический массив,
 * чтобы тест мог «вручную» дёрнуть пересечение через `trigger()`.
 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []

  root: Element | Document | null = null
  rootMargin = ''
  thresholds: ReadonlyArray<number> = []

  private callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
}

beforeEach(() => {
  MockIntersectionObserver.instances = []
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useInfiniteList', () => {
  it('DEFAULT_PAGE_SIZE = 20 (AC #175)', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20)
  })

  it('показывает первую страницу из 20 элементов', () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(50)))

    expect(result.current.visibleItems).toHaveLength(20)
    expect(result.current.hasMore).toBe(true)
  })

  it('если элементов меньше страницы — показывает всё, hasMore = false', () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(3)))

    expect(result.current.visibleItems).toHaveLength(3)
    expect(result.current.hasMore).toBe(false)
  })

  it('если элементов ровно страница — hasMore = false', () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(20)))

    expect(result.current.visibleItems).toHaveLength(20)
    expect(result.current.hasMore).toBe(false)
  })

  it('pageSize можно переопределить', () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(50), { pageSize: 5 }))

    expect(result.current.visibleItems).toHaveLength(5)
  })

  it('догружает по 20 при срабатывании IntersectionObserver', async () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(50)))

    act(() => {
      result.current.sentinelRef({} as HTMLElement)
    })

    await waitFor(() => {
      expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0)
    })

    const observer =
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]

    act(() => {
      observer.trigger(true)
    })

    expect(result.current.visibleItems).toHaveLength(40)
    expect(result.current.hasMore).toBe(true)
  })

  it('останавливается, когда элементы закончились', async () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(30)))

    act(() => {
      result.current.sentinelRef({} as HTMLElement)
    })

    await waitFor(() => {
      expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0)
    })

    act(() => {
      MockIntersectionObserver.instances[
        MockIntersectionObserver.instances.length - 1
      ].trigger(true)
    })

    expect(result.current.visibleItems).toHaveLength(30)
    expect(result.current.hasMore).toBe(false)
  })

  it('resetKey сбрасывает пагинацию к pageSize', async () => {
    const items = makeItems(50)

    const { result, rerender } = renderHook(
      ({ resetKey }: { resetKey: string }) => useInfiniteList(items, { resetKey }),
      { initialProps: { resetKey: 'a' } },
    )

    act(() => {
      result.current.sentinelRef({} as HTMLElement)
    })

    await waitFor(() => {
      expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0)
    })

    // догружаем до 40
    act(() => {
      MockIntersectionObserver.instances[
        MockIntersectionObserver.instances.length - 1
      ].trigger(true)
    })
    expect(result.current.visibleItems).toHaveLength(40)

    // имитируем смену фильтров — начинаем заново
    rerender({ resetKey: 'b' })

    expect(result.current.visibleItems).toHaveLength(20)
  })

  it('при уменьшении массива hasMore становится false', () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: { id: number }[] }) => useInfiniteList(items),
      { initialProps: { items: makeItems(50) } },
    )

    expect(result.current.hasMore).toBe(true)

    rerender({ items: makeItems(10) })

    expect(result.current.hasMore).toBe(false)
  })
})
