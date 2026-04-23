import { useState, useEffect } from 'react';

//Hook pro zjišťování šířky obrazovky
//Vytvořen pro potřeby responzivního webu
export function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowWidth;
}