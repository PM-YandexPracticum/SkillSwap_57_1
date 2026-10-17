import { FC, useCallback } from 'react'
import { User } from '@/shared/types'
import { getSimilarUsers } from '@/entities/user/lib/getSimilarUsers.ts'
import ChevronIcon from '@/shared/assets/icons/chevron.svg?react'
import styles from './SimilarOffers.module.css'
import useEmblaCarousel from 'embla-carousel-react'
import { UserCardItem } from '@/pages/CatalogPage/ui/UserCardItem.tsx'
import { useAppSelector } from '@/store/hooks.ts'
import { selectUsers } from '@/entities/user/model/usersSlice.ts'
import { selectSkills } from '@/entities/skill/model/skillsSlice.ts'

type TSimilarOffersProps = {
  currentUser: User
}

export const SimilarOffers: FC<TSimilarOffersProps> = ({ currentUser }) => {
  const users = useAppSelector(selectUsers)
  const skills = useAppSelector(selectSkills)
  const skillId = currentUser.teachSkillId

  const filteredUsers: User[] = getSimilarUsers(users, skills, skillId).filter(
    (user) => user.id !== currentUser.id,
  )

  const shouldShowArrows = filteredUsers.length > 4

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  if (!filteredUsers.length) return null

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Похожие предложения</h2>

      <div className={styles.carouselWrapper}>
        {shouldShowArrows && (
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={scrollPrev}
            aria-label="Предыдущий слайд"
          >
            <ChevronIcon className={styles.arrowIcon} aria-hidden="true" />
          </button>
        )}

        <div className={styles.emblaContainer} ref={emblaRef} style={{ overflow: 'hidden', width: '100%' }}>
          <ul className={`${styles.list}`}>
            {filteredUsers.map((user) => (
              <li key={user.id} className={`${styles.listItem}`}>
                <UserCardItem user={user} />
              </li>
            ))}
          </ul>
        </div>

        {shouldShowArrows && (
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={scrollNext}
            aria-label="Следующий слайд"
          >
            <ChevronIcon className={styles.arrowIcon} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}
