import { useState, useCallback } from 'react'

export const useCarousel = (itemsLength) => {
  const [items, setItems] = useState(Array.from({ length: itemsLength }, (_, i) => i))
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [direction, setDirection] = useState(null)

  const showSlider = useCallback((type) => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setDirection(type)

    setItems(prevItems => {
      if (type === 'next') {
        // Move first item to end
        const newItems = [...prevItems]
        const first = newItems.shift()
        newItems.push(first)
        return newItems
      } else {
        // Move last item to front
        const newItems = [...prevItems]
        const last = newItems.pop()
        newItems.unshift(last)
        return newItems
      }
    })

    // Re-enable buttons after animation
    setTimeout(() => {
      setIsAnimating(false)
      setDirection(null)
    }, 2000)
  }, [isAnimating])

  const handleNext = useCallback(() => {
    showSlider('next')
  }, [showSlider])

  const handlePrev = useCallback(() => {
    showSlider('prev')
  }, [showSlider])

  const toggleDetail = useCallback(() => {
    setShowDetail(prev => !prev)
  }, [])

  return {
    items,
    isAnimating,
    showDetail,
    direction,
    handleNext,
    handlePrev,
    toggleDetail
  }
}
