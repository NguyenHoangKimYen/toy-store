export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatPhone = (phone) => {
  // Format: 0909999999 -> 090 999 9999
  if (!phone) return 'N/A'
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
}

export const getRoleBadgeColor = (role) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
    customer: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  }
  return colors[role] || 'bg-gray-100 text-gray-700'
}
