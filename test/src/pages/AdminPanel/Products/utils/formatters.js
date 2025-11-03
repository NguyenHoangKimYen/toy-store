export const formatPrice = (price) => {
  const value = price?.$numberDecimal || price
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(value)
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
