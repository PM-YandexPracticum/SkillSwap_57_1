import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PAGE_SIZE, useInfiniteList } from './useInfiniteList'

const makeItems = (count: number) => Array.from({ length: count }, (_, id) => ({ id }))

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

const latestObserver = () =>
  MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]

/** Эмулирует первый скролл — observer создастся только после него */
const simulateFirstScroll = () => {
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('useInfiniteList', () => {
  it('DEFAULT_PAGE_SIZE = 6', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(6)
  })

  it('показывает первую страницу из 6 элементов', () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(50)))

    expect(result.current.visibleItems).toHaveLength(6)
    expect(result.current.hasMore).toBe(true)
  })

  it('если элементов меньше страницы — показывает всё, hasMore = false', () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(3)))

    expect(result.current.visibleItems).toHaveLength(3)
    expect(result.current.hasMore).toBe(false)
  })

  it('если элементов ровно страница — hasMore = false', () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(6)))

    expect(result.current.visibleItems).toHaveLength(6)
    expect(result.current.hasMore).toBe(false)
  })

  it('pageSize можно переопределить', () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(50), { pageSize: 5 }))

    expect(result.current.visibleItems).toHaveLength(5)
  })

  it('не догружает без скролла пользователя', async () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(50)))

    act(() => {
      result.current.sentinelRef({} as HTMLElement)
    })

    // observer ещё не создан — скролла не было
    expect(MockIntersectionObserver.instances.length).toBe(0)

    // ждём дольше LOAD_DELAY_MS — спиннер не должен «мигнуть» и ничего не грузится
    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(result.current.visibleItems).toHaveLength(6)
  })

  it('догружает ещё 6 после первого скролла и появления sentinel', async () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(50)))

    act(() => {
      result.current.sentinelRef({} as HTMLElement)
    })

    simulateFirstScroll()

    await waitFor(() => {
      expect(MockIntersectionObserver.instances.length).toBe(1)
    })

    act(() => {
      latestObserver().trigger(true)
    })

    // Сразу после trigger — ещё 6 (задержка работает)
    expect(result.current.visibleItems).toHaveLength(6)

    await waitFor(
      () => expect(result.current.visibleItems).toHaveLength(12),
      { timeout: 1000 },
    )
    expect(result.current.hasMore).toBe(true)
  })

  it('останавливается, когда элементы закончились', async () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(10)))

    act(() => {
      result.current.sentinelRef({} as HTMLElement)
    })
    simulateFirstScroll()

    await waitFor(() => {
      expect(MockIntersectionObserver.instances.length).toBe(1)
    })

    act(() => {
      latestObserver().trigger(true)
    })

    await waitFor(
      () => expect(result.current.visibleItems).toHaveLength(10),
      { timeout: 1000 },
    )
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
    simulateFirstScroll()

    await waitFor(() => {
      expect(MockIntersectionObserver.instances.length).toBe(1)
    })

    act(() => {
      latestObserver().trigger(true)
    })
    await waitFor(
      () => expect(result.current.visibleItems).toHaveLength(12),
      { timeout: 1000 },
    )

    rerender({ resetKey: 'b' })
    expect(result.current.visibleItems).toHaveLength(6)
  })

  it('при уменьшении массива hasMore становится false', () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: { id: number }[] }) => useInfiniteList(items),
      { initialProps: { items: makeItems(50) } },
    )

    expect(result.current.hasMore).toBe(true)
    rerender({ items: makeItems(3) })
    expect(result.current.hasMore).toBe(false)
  })

  it('не запускает параллельные таймеры при повторном isIntersecting', async () => {
    const { result } = renderHook(() => useInfiniteList(makeItems(50)))

    act(() => {
      result.current.sentinelRef({} as HTMLElement)
    })
    simulateFirstScroll()

    await waitFor(() => {
      expect(MockIntersectionObserver.instances.length).toBe(1)
    })

    act(() => {
      latestObserver().trigger(true)
      latestObserver().trigger(true)
    })

    await waitFor(
      () => expect(result.current.visibleItems).toHaveLength(12),
      { timeout: 1000 },
    )
    expect(result.current.visibleItems).toHaveLength(12)
  })
})
