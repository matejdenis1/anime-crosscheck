import Day from "../animes-components/Day";
import { useEffect, useState, useRef, useCallback, useMemo} from "react";
import { Button, Container} from "react-bootstrap";
import { ScrollHint } from "../misc/ScrollHint";
import { useWindowWidth } from "../hooks/useWindowWidth";
import useFetch from '../hooks/useFetch';
import useAnimes from "../hooks/useAnimes";
import API_URL from "../../config/api";
const Layout = () => {
    //Zde se vytváří objekt pro dny v týdnu, který bude sloužit jako základ pro rozřazení anime podle dnů jejich epizod
    const days = useMemo(() => ({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
    }), [])

    const {data: allAnimes} = useFetch(`${API_URL}/api/animes`, ['animes'] , true)

    const {animes: animesOfInterest} = useAnimes();
    const [daysArray, setDaysArray] = useState(Object.entries(days))
    const [activeButton, setActiveButton] = useState("")
    const windowWidth = useWindowWidth();


    //Hodnoty pro scrollování rozložení anime
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [showIndicator, setShowIndicator] = useState(false);
    const [isSticky, setSticky] = useState(false);

    //Hodnoty pro přilepení názvů dnů (sticky)
    const scrollRef = useRef(null);
    const daysRef = useRef(null)
    const sentinelRef = useRef(null)
    const [dashboardHeaderHeight, setDashboardHeaderHeight] = useState(0);

    //Kontrola výšky navbaru pro potřeby sticky chování
    //Jakmile by bootstrap při změně šířky změnil i výšku navbaru, aktualizuje se i dashboardHeaderHeight,
    //což zajistí správné odsazení při přilepení názvů dnů v dynamicky měnícím se prostředí
    useEffect(() => {
    const updateHeaderHeight = () => {
        const dashboardHeader = document.querySelector('nav')
        setDashboardHeaderHeight(prev => dashboardHeader.offsetHeight !== prev ? dashboardHeader.offsetHeight : prev);
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => {
        window.removeEventListener('resize', updateHeaderHeight);
    };
    }, []);

    //Vytvoření observeru pro přichycení názvů dnů
    //
    // Observer sleduje sentinel element, který indikuje, kdy se mají názvy dnů přilepit k horní části komponentu
    // Kontrola dashboardHeight pro nastavení odsazení při přilepení
    // Při změně scrollu rozložení se daysHeader posune společně s ním
    useEffect(() => {
    const container = scrollRef.current;
    const headerRef = daysRef.current;
    const sentinel = sentinelRef.current;
    if (!container || !headerRef || !sentinel) return;

    const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        const shouldStick = entry.boundingClientRect.y < dashboardHeaderHeight
        setSticky(shouldStick);
    }, {
        threshold: [0, 1], rootMargin: `-${dashboardHeaderHeight}px 0px 0px 0px`
    });
    observer.observe(sentinel);

    const handleScroll = (e) => {
    
    // Synchronizace scrollu rozložení a názvů dnů při průběžném scrollování už inicializovaného přichycení
    const scrollValue = e.target.scrollLeft
      container.scrollTo({left: scrollValue, behavior: 'instant'})
      headerRef.scrollTo({left: scrollValue, behavior: 'instant'})
    };
    container.addEventListener('scroll', handleScroll);
    return () => {
        observer.disconnect();
        container.removeEventListener('scroll', handleScroll);
    }
    }, [dashboardHeaderHeight]);
    
    //Synchronizace scrollu rozložení a názvů dnů při inicializaci scroll rozložení
    //V případě, že by uživatel měl posunutý seznam bez přichycené hlavičky a následně se hlavička přilepí - hlavička nebude správně posunutá
    //Tato synchronizace řeší tento problém
    useEffect(() => {
        if(scrollRef.current && daysRef.current){
            daysRef.current.scrollLeft = scrollRef.current.scrollLeft
        }
    }, [scrollRef?.current?.scrollLeft])
    
    //Zobrazení indikátoru, pokud je rozložení horizontálně scrollovatelné
    useEffect(() => {
        const stack = scrollRef.current;
        if (stack && stack.scrollWidth> stack.clientWidth) {
                setShowIndicator(true);
        }
        else{
            setShowIndicator(false)
        }
    }, [windowWidth])


    //Funkce pro obsluhu horizontálního scrollování rozložení anime tažením myši
    //Aktualizují pozici na základě pohybu myši a zajišťují správné chování kurzoru
    const handleMouseLeave = (ref) => {
        setIsDragging(false);
        ref.current.style.cursor = 'grab';
    };
    const handleMouseDown = (e, ref) => {
        setIsDragging(true);
        setStartX(e.pageX - ref.current.offsetLeft);
        setScrollLeft(ref.current.scrollLeft);
        ref.current.style.cursor = 'grabbing';
     };
    const handleMouseUp = (ref) => {
        setIsDragging(false);
        ref.current.style.cursor = 'grab';
     };

     const handleMouseMove = (e, ref) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - ref.current.offsetLeft;
        const walk = (x - startX);
        ref.current.scrollLeft = scrollLeft - walk;
     };


     //Rozřazení anime do odpovídajících dnů podle dnů jejich epizod
     const filterByDay = useCallback((animes) => {
        const newDays = structuredClone(days)
        animes.forEach((anime) => {
            const dayName = new Date(anime.episodeDate).toLocaleDateString("en-US", {
                weekday: "long",
            });
            newDays[dayName].push(anime);
        });
        //Seřazení anime v jednotlivých dnech podle data epizody
        Object.keys(newDays).forEach(day => {
                newDays[day].sort((a, b) => new Date(a.episodeDate) - new Date(b.episodeDate));
        })
        setDaysArray(Object.entries(newDays))
    }, [days])

    const handleShowAll = useCallback(() => {
        filterByDay(allAnimes)
        setActiveButton("showAll")
    }, [filterByDay, allAnimes])

    const handleShowFav = useCallback(() => {
        const filteredAnimes = allAnimes.filter(anime => animesOfInterest.includes(anime.id))
        filterByDay(filteredAnimes)
        setActiveButton("showFav")
    }, [allAnimes, filterByDay, animesOfInterest])

    useEffect(()=>{
        if(allAnimes){
            animesOfInterest.length > 0 ? handleShowFav() : handleShowAll()
        }
    }, [allAnimes, animesOfInterest, handleShowFav, handleShowAll])
    return (
        <>
        {
            (         
            <>
            <Container className="p-2 rounded mt-2 mb-2 w-auto">
                <Button variant="secondary" className={'rounded-0 rounded-start'+(activeButton === "showAll" ? ' active' : '')} onClick={handleShowAll}>Show All</Button>
                <Button variant="secondary" className={'rounded-0 rounded-end ms-1'+(activeButton === "showFav" ? ' active' : '')} onClick={handleShowFav}>Show Favorites</Button>
            </Container>
            <div ref={sentinelRef} style={{height: '1px'}} />
            {isSticky && <div style={{height: daysRef.current?.offsetHeight || 0}} />}
            <Container className="overflow-x-auto user-select-none border border-secondary rounded shadow-lg p-1" style={{cursor: "grab", scrollbarWidth: 'none', scrollbarGutter: 'stable', maxWidth: '1410px'}}
                ref={scrollRef} 
                onMouseDown={(e) => handleMouseDown(e, scrollRef)}
                onMouseLeave={() => handleMouseLeave(scrollRef)}
                onMouseUp={() => handleMouseUp(scrollRef)}
                onMouseMove={(e) => handleMouseMove(e, scrollRef)}
                >
                {showIndicator && <ScrollHint />}
                <Container className="p-0 m-0">
                    <div ref={daysRef} className={`z-3 ${isSticky && 'position-fixed overflow-x-hidden'}`} style={{width: scrollRef.current?.offsetWidth-5 || '100%', scrollbarWidth: 'none', scrollbarGutter: 'stable', ...(isSticky && {top: `${dashboardHeaderHeight}px`})}}>
                        <div className="d-flex">
                            {
                                Object.keys(days).map((day,index) => {
                                    const today = new Date().getDay() === (index+1) % 7;
                                    return <div key={day} className={"bg-secondary text-center"+(today ? ' bg-dark' : '')} style={{borderRight: '2px solid white', zIndex: 3, minWidth: '200px', scrollbarWidth: 'none', scrollbarGutter: 'stable'}}>
                                        <h5 style={{color: today ? "rgba(255, 255, 255, 1)" : "rgba(0,0,0,1)"}}>{day}</h5>
                                    </div>  
                                })
                            }
                        </div>
                    </div>                    
                    <div className="d-flex" style={{width: 'max-content'}}>
                        {
                        daysArray.map(([dayName, animeList]) => (
                            <Day key={dayName} animeList={animeList} />   
                        )) 
                        }
                    </div>
                </Container>
            </Container>   
            </>)               
        }
        </>
    );
};

export default Layout;