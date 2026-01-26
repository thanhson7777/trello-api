// Tính toán giá trị để phục vụ cho việc phân trang
export const pagingSkipValue = (page, itemsPerPage) => {
  // Nếu giá trị không hợp lệ thì return về 0
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0

  return (page - 1) * itemsPerPage
}
