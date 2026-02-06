import { env } from '~/config/environment'
// Những domain được phép truy cập vào tài nguyên của server
export const WHITELIST_DOMAINS = [
  // Không cần localhost nữa vì ở file cors đã luôn luôn cho phép chạy trên mỗi trường dev
  // 'http://localhost:5173',
  // 'http://192.168.0.197:5173'
  'https://trello-web-six-gilt.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBISTE_DOMAIN_PRODUCTION : env.WEBISTE_DOMAIN_DEVELOPMENT

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEM_PER_PAGE = 12

export const INVATATION_TYPE = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}

export const BOARD_INVATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}
