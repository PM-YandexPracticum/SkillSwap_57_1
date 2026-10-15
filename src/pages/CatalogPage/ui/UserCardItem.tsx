import type { User } from '@/shared/types'
import { SkillCard } from '@/widgets/SkillCard'
import { useUserCardProps } from '@/features/user-card'

type UserCardItemProps = {
  user: User
}

export function UserCardItem({ user }: UserCardItemProps) {
  return <SkillCard {...useUserCardProps(user)} />
}
