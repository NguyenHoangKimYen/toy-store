import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ProductImageGallery = ({ images, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  return (
    <div>
      {/* Main Image */}
      <div className='relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4'>
        <img
          src={images[currentImageIndex]}
          alt={productName}
          className='w-full h-full object-cover'
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className='absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors'
            >
              <ChevronLeft className='w-5 h-5' />
            </button>
            <button
              onClick={nextImage}
              className='absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors'
            >
              <ChevronRight className='w-5 h-5' />
            </button>
          </>
        )}
        {/* Image Counter */}
        <div className='absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm'>
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className='flex gap-2 overflow-x-auto'>
          {images.map((url, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                currentImageIndex === index 
                  ? 'border-blue-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <img
                src={url}
                alt={`${productName} ${index + 1}`}
                className='w-full h-full object-cover'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductImageGallery
