import { useEffect } from 'react'
import { loadCategories } from '@/entities/category/model/categoriesSlice'
import { loadCities } from '@/entities/city/model/citiesSlice'
import { loadSkills } from '@/entities/skill/model/skillsSlice'
import { loadUsers } from '@/entities/user/model/usersSlice'
import { loadNotifications } from '@/features/notifications'
import { useAppDispatch } from '@/store/hooks'

/** Загружает справочные данные каталога один раз при старте приложения */
export function CatalogLoader() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    void dispatch(loadUsers())
    void dispatch(loadSkills())
    void dispatch(loadCategories())
    void dispatch(loadCities())
    void dispatch(loadNotifications())
  }, [dispatch])

  return null
}
