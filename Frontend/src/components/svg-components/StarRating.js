import { useEffect } from 'react'
import { useState} from 'react';


// Tento komponent vytváří hvězdičkové hodnocení. 
// Jeho stav se aktualizuje na základě props rating, 
// a když uživatel klikne na hvězdičku, zavolá handleSetRating a tím aktualizuje novým hodnocením.
export const StarRating = ({handleSetRating, rating}) => {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hoverIndex, setHoverIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(rating-1)
  }, [rating])

  const handleRating = (index) => {
    setActiveIndex(index);
    handleSetRating(index+1)
  }

  return (
    <>
    {
    Array.from({length: 5}).map((_, i) => (
    <div key={i} onMouseEnter={() => { setHoverIndex(i)}} onMouseLeave={() => setHoverIndex(-1)}>
      <button 
      onClick={() => handleRating(i)}
      style={{
        backgroundColor: 'transparent',
        borderColor: 'rgba(0,0,0,0)',
        transition: "transform 0.2s ease-in-out",
        ...(hoverIndex >= i 
            ? { cursor: "pointer", transform: "scale(1.2)"} 
            : { cursor: "default" }
        )
      }}>
      {
        <svg width="50" height="50" viewBox="0 0 24 24" fill={hoverIndex >= i || activeIndex >= i ? "yellow" : "none"} stroke='yellow'>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      }
      </button>
    </div>
))}                                                       
    </>
  )
}
