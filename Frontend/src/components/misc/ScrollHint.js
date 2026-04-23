import { useState, useEffect, useRef} from 'react';
import { CSSTransition } from 'react-transition-group';

//Tato komponenta zobrazuje nápovědu pro scrollování, která se po 3 sekundách automaticky skryje
//Používá se na mobilních zařízeních, kde není zřejmé, že je možné scrollovat
export const ScrollHint = () => {
  const [show, setShow] = useState(true);
  const nodeRef = useRef(null)
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  })
  return (
    <CSSTransition nodeRef={nodeRef} in={show} timeout={500} classNames='animate__animated animate__fadeOut animate__delay__2s' unmountOnExit>
        <div ref={nodeRef} className="animate__animated animate__fadeIn position-fixed pointer-events-none ps-4" style={{zIndex: 9999}}>
        <div className="bg-dark text-white px-5 py-2 rounded text-sm">
          <span>Swipe</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </CSSTransition>
    
  );
};