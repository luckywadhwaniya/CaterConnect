export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  try {
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${m} ${ampm}`
  } catch {
    return timeStr
  }
}

export const downloadBlob = (blob, filename = 'caterconnect-order.pdf') => {
  const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    accepted: 'blue',
    preparing: 'orange',
    ready: 'emerald',
    completed: 'gray',
    rejected: 'red',
    cancelled: 'red',
  }
  return colors[status?.toLowerCase()] || 'gray'
}
