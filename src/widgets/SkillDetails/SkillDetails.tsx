import { useEffect, useState, type ReactNode } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import ChevronIcon from '@/shared/assets/icons/chevron.svg?react'
import styles from './SkillDetails.module.css'

const PLACEHOLDER_IMAGE = '/images/skills/placeholder.jpg'
const MAX_VISIBLE_THUMBNAILS = 3

export type SkillDetailsProps = {
  title: string
  categoryName: string
  subcategoryName: string
  description: string
  images: string[]
  actions?: ReactNode
  showGalleryControls?: boolean
  className?: string
}

export function SkillDetails({
  title,
  categoryName,
  subcategoryName,
  description,
  images,
  actions,
  showGalleryControls = false,
  className = '',
}: SkillDetailsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    watchDrag: images.length > 1,
  })

  // Копия выбранного индекса только для оформления миниатюр.
  // Все переключения выполняет Embla.
  const [selectedIndex, setSelectedIndex] = useState(0)
  const imagesKey = JSON.stringify(images)

  useEffect(() => {
    if (!emblaApi) return

    const updateSelectedIndex = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', updateSelectedIndex)
    emblaApi.on('reInit', updateSelectedIndex)
    updateSelectedIndex()

    return () => {
      emblaApi.off('select', updateSelectedIndex)
      emblaApi.off('reInit', updateSelectedIndex)
    }
  }, [emblaApi])

  // Сбрасываем галерею только при изменении адресов или порядка картинок.
  // Новый массив с теми же адресами не сбрасывает выбранный слайд.
  useEffect(() => {
    if (!emblaApi) return
    emblaApi.reInit({ startIndex: 0 })
  }, [emblaApi, imagesKey])

  const hasImages = images.length > 0
  const slides = hasImages ? images : [PLACEHOLDER_IMAGE]
  const safeIndex = Math.min(selectedIndex, slides.length - 1)
  const showArrows = showGalleryControls && images.length > 1
  const visibleImages = images.slice(1, MAX_VISIBLE_THUMBNAILS)
  const hiddenCount = Math.max(0, images.length - 1 - visibleImages.length)
  const lastImageIndex = images.length - 1
  const isHiddenImageSelected = safeIndex >= MAX_VISIBLE_THUMBNAILS

  return (
    <article className={[styles.container, className].filter(Boolean).join(' ')}>
      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.textBlock}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.category}>
              {categoryName} / {subcategoryName}
            </p>
          </div>
          <p className={styles.description}>{description}</p>
        </div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      <div className={styles.gallery}>
        <div
          className={styles.mainImage}
          role="group"
          aria-roledescription="карусель"
          aria-label={`Изображения навыка «${title}»`}
        >
          <div className={styles.viewport} ref={emblaRef}>
            <div className={styles.track}>
              {slides.map((image, index) => (
                <div
                  className={styles.slide}
                  key={`${image}-${index}`}
                  aria-hidden={index !== safeIndex}
                >
                  <img
                    src={image}
                    alt={hasImages ? `${title} — изображение ${index + 1}` : 'Нет изображения'}
                    className={styles.image}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {showArrows && (
            <>
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowPrev}`}
                onClick={() => emblaApi?.scrollPrev()}
                aria-label="Предыдущее изображение"
              >
                <ChevronIcon className={styles.arrowIcon} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowNext}`}
                onClick={() => emblaApi?.scrollNext()}
                aria-label="Следующее изображение"
              >
                <ChevronIcon className={styles.arrowIcon} aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <ul className={styles.thumbnails} aria-label="Превью изображений">
            {visibleImages.map((image, index) => {
              const imageIndex = index + 1
              const isActive = imageIndex === safeIndex

              return (
                <li key={`${image}-${imageIndex}`} className={styles.thumbnailItem}>
                  <button
                    type="button"
                    className={`${styles.thumbnail} ${isActive ? styles.thumbnailActive : ''}`}
                    onClick={() => emblaApi?.scrollTo(imageIndex)}
                    aria-label={`Показать изображение ${imageIndex + 1}`}
                    aria-pressed={isActive}
                  >
                    <img src={image} alt="" className={styles.thumbnailImage} draggable={false} />
                  </button>
                </li>
              )
            })}

            {hiddenCount > 0 && (
              <li className={styles.thumbnailItem}>
                <button
                  type="button"
                  className={`${styles.thumbnail} ${
                    isHiddenImageSelected ? styles.thumbnailActive : ''
                  }`}
                  onClick={() => emblaApi?.scrollTo(lastImageIndex)}
                  aria-label={`Показать последнее изображение. Ещё изображений: ${hiddenCount}`}
                  aria-pressed={isHiddenImageSelected}
                >
                  <img
                    src={images[lastImageIndex]}
                    alt=""
                    className={styles.thumbnailImage}
                    draggable={false}
                  />
                  <span className={styles.thumbnailMore} aria-hidden="true">
                    +{hiddenCount}
                  </span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  )
}
