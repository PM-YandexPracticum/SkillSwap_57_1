import type { Category, TCategoryId } from '@/shared/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isList(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

function parseCategoryId(value: unknown): TCategoryId {
  const allowedIds: TCategoryId[] = [
    'business',
    'creative',
    'languages',
    'education',
    'health',
    'home',
  ]
  const id = allowedIds.find((allowedId) => allowedId === value)

  if (id === undefined) {
    throw new Error('Неизвестный идентификатор категории')
  }

  return id
}

function parseCategories(data: unknown): Category[] {
  if (!isList(data)) {
    throw new Error('В JSON должен быть массив категорий')
  }

  return data.map((category) => {
    if (
      !isRecord(category) ||
      typeof category.name !== 'string' ||
      !isList(category.subcategories)
    ) {
      throw new Error('Некорректные данные категории')
    }

    return {
      id: parseCategoryId(category.id),
      name: category.name,
      subcategories: category.subcategories.map((subcategory) => {
        if (
          !isRecord(subcategory) ||
          typeof subcategory.id !== 'string' ||
          typeof subcategory.name !== 'string'
        ) {
          throw new Error('Некорректные данные подкатегории')
        }

        return {
          id: subcategory.id,
          name: subcategory.name,
          categoryId: parseCategoryId(subcategory.categoryId),
        }
      }),
    }
  })
}

export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}db/categories.json`, { signal })
  if (!response.ok) {
    throw new Error(`Не удалось загрузить категории: ${response.status}`)
  }

  const data: unknown = await response.json()
  return parseCategories(data)
}
