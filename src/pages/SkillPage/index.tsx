import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import HeartIcon from '@/shared/assets/icons/heart.svg?react'
import HeartFilledIcon from '@/shared/assets/icons/heart-filled.svg?react'
import ShareIcon from '@/shared/assets/icons/share.svg?react'
import MoreIcon from '@/shared/assets/icons/more.svg?react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loadUsers, selectUsers, selectUsersStatus } from '@/entities/user/model/usersSlice'
import { loadSkills, selectSkills, selectSkillsStatus } from '@/entities/skill/model/skillsSlice'
import { loadCategories, selectCategories } from '@/entities/category/model/categoriesSlice'
import { loadCities, selectCities } from '@/entities/city/model/citiesSlice'
import { getUserCardData } from '@/entities/user/lib/getUserCardData'
import { selectIsFavorite, toggleFavorite } from '@/features/favorites/model/favoritesSlice'
import { SkillCard } from '@/widgets/SkillCard'
import { SkillDetails } from '@/widgets/SkillDetails'
import { IconButton } from '@/shared/ui/IconButton'
import { Spinner } from '@/shared/ui/Spinner'
import { ROUTES } from '@/shared/lib/constants'
import { SwapRequestButton } from '@/features/swap-request/ui/SwapRequestButton'
import styles from './SkillPage.module.css'
import { SimilarOffers } from '@/widgets/SimilarOffers'

export default function SkillPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()

  const users = useAppSelector(selectUsers)
  const skills = useAppSelector(selectSkills)
  const categories = useAppSelector(selectCategories)
  const cities = useAppSelector(selectCities)
  const usersStatus = useAppSelector(selectUsersStatus)
  const skillsStatus = useAppSelector(selectSkillsStatus)

  // Страницу могут открыть по прямой ссылке — загружаем всё нужное (повторные загрузки пропускаются)
  useEffect(() => {
    void dispatch(loadUsers())
    void dispatch(loadSkills())
    void dispatch(loadCategories())
    void dispatch(loadCities())
  }, [dispatch])

  const skill = skills.find((item) => item.id === id)
  const author = users.find((user) => user.teachSkillId === id)
  const isFavorite = useAppSelector((state) =>
    author ? selectIsFavorite(state, author.id) : false,
  )

  if (usersStatus === 'failed' || skillsStatus === 'failed') {
    return <Navigate to={ROUTES.SERVER_ERROR} replace />
  }

  if (usersStatus !== 'succeeded' || skillsStatus !== 'succeeded') {
    return <Spinner className={styles.loading} />
  }

  if (!skill || !author) {
    return <Navigate to="/404" replace />
  }

  const card = getUserCardData(author, skills, categories, cities)
  const category = categories.find((item) => item.id === skill.categoryId)
  const subcategory = category?.subcategories.find((item) => item.id === skill.subcategoryId)

  const headerActions = (
    <>
      <IconButton
        icon={isFavorite ? <HeartFilledIcon /> : <HeartIcon />}
        label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        active={isFavorite}
        onClick={() => dispatch(toggleFavorite(author.id))}
      />
      {/* «Поделиться» и «Ещё» — заглушки по макету */}
      <IconButton icon={<ShareIcon />} label="Поделиться" onClick={() => undefined} />
      <IconButton icon={<MoreIcon />} label="Ещё" onClick={() => undefined} />
    </>
  )

  return (
    <div className={styles.page}>
      <section className={styles.top}>
        <SkillCard
          {...card}
          about={author.about}
          showFavorite={false}
          showDetailsButton={false}
          collapsed={false}
          className={styles.author}
        />

        <SkillDetails
          className={styles.details}
          title={skill.title}
          categoryName={category?.name ?? ''}
          subcategoryName={subcategory?.name ?? ''}
          description={skill.description}
          images={skill.images}
          showGalleryControls
          headerActions={headerActions}
          actions={
            <SwapRequestButton
              className={styles.exchangeButton}
              skillId={skill.id}
              ownerId={author.id}
            />
          }
        />
        <SimilarOffers currentUser={author}/>
      </section>

      {/* Похожие предложения — задача #163 */}
    </div>
  )
}
