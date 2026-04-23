import { useState, useEffect, useRef } from 'react';


//Hook, který kontroluje, zda je uživatel na začátku stránky
//Tento hook se používá pro vykreslení tlačítka, které nastaví scroll stránky na určenou hodnotu
export function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const initialScrollY = window.scrollY || window.pageYOffset || 0;
    setScrollY(initialScrollY);

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setScrollY(0);
        } else {
          const currentScrollY = window.scrollY || window.pageYOffset || 0;
          setScrollY(currentScrollY);
        }
      },
      {
        threshold: 0,
        rootMargin: '0px',
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { scrollY, sentinelRef };
}
