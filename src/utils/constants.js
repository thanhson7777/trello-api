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
