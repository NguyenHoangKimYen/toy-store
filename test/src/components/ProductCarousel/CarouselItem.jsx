import React from 'react'

const CarouselItem = ({ item, index, showDetail }) => {
  return (
    <div className={`carousel-item`} data-index={index}>
      <img src={item.image} alt={item.topic} />
      
      {/* Introduce section */}
      {index === 1 && !showDetail && (
        <div className='introduce'>
          <div className='title'>{item.title}</div>
          <div className='topic'>{item.topic}</div>
          <div className='des'>{item.description}</div>
          <button className='seeMore'>
            SEE MORE &#8599;
          </button>
        </div>
      )}

      {/* Detail section */}
      {index === 1 && showDetail && (
        <div className='detail'>
          <div className='title'>{item.detailTitle}</div>
          <div className='des'>{item.detailDescription}</div>
          <div className='specifications'>
            {item.specifications.map((spec, i) => (
              <div key={i}>
                <p>{spec.label}</p>
                <p>{spec.value}</p>
              </div>
            ))}
          </div>
          <div className='checkout'>
            <button>ADD TO CART</button>
            <button>CHECKOUT</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CarouselItem
