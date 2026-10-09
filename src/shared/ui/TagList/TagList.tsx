import styles from './TagList.module.css'
import { TCategoryId } from '@/shared/types'
import { Tag } from '@/shared/ui/Tag'
import { useLayoutEffect, useRef, useState } from 'react'

type TagListProps = {
  title: string
  collapsed?: boolean
  tags: {
    id: string
    name: string
    categoryId: TCategoryId
  }[]
  className?: string
}

export const TagList = ({ title, collapsed=false, tags, className }: TagListProps) => {
  const tagsClasses = [styles.tags, collapsed && styles.collapsed].filter(Boolean).join(' ')
  const containerClasses = [styles.container, className].filter(Boolean).join(' ')

  const tagsContainerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [visibleTags, setVisibleTags] = useState(tags.length)



  useLayoutEffect(() => {
    const container = tagsContainerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    const calculateVisible = () => {
      const containerWidth = container.offsetWidth
      const children = Array.from(measure.children) as HTMLElement[]

      if (collapsed) {
        setVisibleTags(tags.length)
        return
      }

      if (children.length === 0) {
        return
      }

      let currentWidth = 0
      let count = 0

      const nButtonWidth = 45
      const gap = parseFloat(getComputedStyle(container).columnGap) || 0

      for (const element of children) {
        const elementWidth = element.offsetWidth

        if (currentWidth + elementWidth + nButtonWidth < containerWidth) {
          currentWidth += elementWidth + gap
          count++
        } else {
          const remainingSpace = containerWidth - currentWidth

          if (remainingSpace > nButtonWidth) {
            setVisibleTags(count)
          } else {
            setVisibleTags(Math.max(0, count - 1))
          }
          return
        }
      }
      setVisibleTags(tags.length)
    }

    calculateVisible()

    const resizeObserver = new ResizeObserver(() => {
      calculateVisible()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [tags, collapsed])

  const hiddenTags = tags.length - visibleTags;

  return (
    <div className={containerClasses}>
      <h4 className={styles.text}>{title}</h4>
      <div ref={measureRef} aria-hidden className={`visually-hidden`}>
        {tags.map((tag, index) => (
          <Tag key={`${tag.id} - ${index + 1}`} label={tag.name} categoryId={tag.categoryId} />
        ))}
      </div>
      <div className={tagsClasses} ref={tagsContainerRef}>
        {tags.slice(0, visibleTags).map((tag, index) => (
          <Tag label={tag.name} categoryId={tag.categoryId} key={`${tag.id} - ${index + 1}`} />
        ))}

        {hiddenTags > 0 && <Tag label={`+${hiddenTags}`} />}
      </div>
    </div>
  )
}
