import { useState } from 'react'
import { Button } from 'react-bootstrap'
//Tento button se renderuje když uživatel není na začátku stránky a po kliknutí posune scroll na začátek stránky
const ScrollToTopButton = () => {
  const [hover, isHovered] = useState(false);
  return (
      <Button 
          onMouseEnter={() => isHovered(true)}
          onMouseLeave={() => isHovered(false)} 
          style={{zIndex: 9999,width: "50px", height: "50px", backgroundColor: "white", color: "black", right: 100, bottom: 50, ...(hover ? {backgroundColor: "rgba(255,255,255,0.8)"} : {backgroundColor: "rgba(255,255,255,1)"} )}}
          className='rounded-circle border-0 position-fixed animate__animated animate__fadeIn' onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <p className='m-0' style={{fontSize: "20pt"}}>&#x2191;</p>
      </Button>
  )
}

export default ScrollToTopButton