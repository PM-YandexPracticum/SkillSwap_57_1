export const ROUTES = {
  HOME: '/',
  SKILL: '/skill/:id',
  PROFILE: '/profile',
  PROFILE_REQUESTS: '/profile/requests',
  PROFILE_EXCHANGES: '/profile/exchanges',
  PROFILE_SKILLS: '/profile/skills',
  FAVORITES: '/favorites',
  CREATE: '/create',
  LOGIN: '/login',
  REGISTER: '/register',
  SERVER_ERROR: '/500',
  SKILLS: '/skills',
} as const

export const SKILL_CATEGORIES = [
  'Программирование',
  'Дизайн',
  'Языки',
  'Музыка',
  'Спорт',
  'Кулинария',
  'Фото и видео',
  'Бизнес',
  'Другое',
] as const

export const LOCAL_STORAGE_KEYS = {
  AUTH_USER: 'skillswap_auth_user',
  FAVORITES: 'skillswap_favorites',
  REQUESTS: 'skillswap_requests',
  THEME: 'skillswap_theme',
  REGISTERED_USERS: 'skillswap_registered_users',
  REGISTERED_SKILLS: 'skillswap_registered_skills',
} as const
