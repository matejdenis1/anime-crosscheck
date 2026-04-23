import { useEffect } from 'react'
import { useState} from 'react';
import { useFavoriteAnime } from '../hooks/useFavoriteAnime';


//Tato komponenta vytváří hvězdu, která se používá pro označení oblíbených anime. 
export const Star = ({id, active}) => {
  const [isActive, setIsActive] = useState(active)
  const {addAnime} = useFavoriteAnime();
  useEffect(() => {
    setIsActive(active)
  }, [active])
  const handleStarClick = (e) => {
    e.currentTarget.blur();
    setIsActive(!isActive);
    addAnime(id)
  }
  return (
    <>
      <div style={{backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 2, position: 'absolute', top: 0}}>
        <button onClick={handleStarClick} className='bg-transparent border-0 hvr-grow'>
            <svg width="50" height="50" viewBox="0 0 24 24" fill={isActive ? "yellow" : "none"} stroke='yellow' >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        </button>
      </div>                                                     
    </>
  )
}
