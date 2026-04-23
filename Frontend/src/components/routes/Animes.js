import {useState, useEffect, useCallback, useRef} from "react"
import { Col,Row, Container, Form, Card, Placeholder, Stack, Button} from "react-bootstrap";
import { Genre } from "../animes-components/Genre";
import Anime from "../animes-components/Anime";
import {useWindowWidth} from '../hooks/useWindowWidth';
import { ScrollHint } from "../misc/ScrollHint";
import useFilterSearch from "../hooks/useFilterSearch";
import useFetch from "../hooks/useFetch";
import useAnimes from "../hooks/useAnimes";
import { ArrowBigLeft, ArrowBigRight} from "lucide-react";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import API_URL from "../../config/api";


//Styly pro kontejner a stack s anime, které se mění podle šířky okna
const containerStyle = {backgroundColor: "rgba(0,0,0,0.2", boxShadow: '0 0 25px -5px'};
const wrapCenterStyle = {flexWrap: 'wrap', justifyContent: 'center'};
const nowrapStartStyle = {flexWrap: 'nowrap', justifyContent: 'start'};

function Animes() {

    const animesRef = useRef(null);
    const {data: animes} = useFetch(`${API_URL}/api/animes`, ['animes'])
    //Používá se pro hledání a filtrování anime
    const {search, filter, handleSearchChange} = useFilterSearch(animes ?? [], ['title','romaji', 'english'])
    const windowWidth = useWindowWidth();
    const [allGenres, setAllGenres] = useState([]);
    const [displayAnime, setDisplayAnime] = useState([])
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [isLoading, setLoading] = useState(true)
    const {animes: animesOfInterest} = useAnimes()
    

    //Šipky pro posouvání seznamu anime v mobilním zobrazení
    const handleArrowClick = useDebouncedCallback((direction) => {
        if (!animesRef.current) return;
        if (direction === 'left') animesRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        if (direction === 'right') animesRef.current.scrollTo({ left: animesRef.current.scrollWidth, behavior: 'smooth' });
    }, {wait: 500});
    
    //Inicializuje data stránky
    useEffect(() => {
        if(animes){
            setAllGenres([...new Set(animes.flatMap(anime => anime.genres))])
            setDisplayAnime(animes)
            setLoading(false)
        }
    }, [animes])

    
    //Funkce pro filtrování anime podle žánrů
    const filterAnimesWithGenre = useCallback((animeList) => {
        return animeList.filter(anime => selectedGenres.every(genre => anime.genres.includes(genre)))
    }, [selectedGenres])

    //Funkce pro přidávání a odebírání žánrů z filtru
    const handleToggleGenre = (genre) => {
        setSelectedGenres((prevSelected) =>
            prevSelected.includes(genre)
                ? prevSelected.filter(g => g !== genre) 
                : [...prevSelected, genre] 
        );
    };

    //Efekt pro aktualizaci zobrazených anime při změně hledání, žánrů nebo načtení dat
    useEffect(() => {
        if(!animes || animes.length === 0) return
        if(search === '' && selectedGenres.length > 0) {
            setDisplayAnime(filterAnimesWithGenre(animes));
            return
        }
        if(selectedGenres.length === 0 && search !== ''){
            setDisplayAnime(filter);
            return
        }
        if(search === '' && selectedGenres.length === 0){
            setDisplayAnime(animes)
            return;
        }
        let display = filter
        display = filterAnimesWithGenre(display)
        setDisplayAnime(display)
    }, [search, selectedGenres, filter, animes, filterAnimesWithGenre])

    

    //Zobrazí načítací placeholdery, pokud se data ještě nenačetla
    if(isLoading){
        return <>
        <Container className="w-75">
            {                         
            <Stack direction="horizontal" className="flex-wrap m-4">
                {
                    Array.from({ length: 16 }).map((_, i) => (                     
                        <Placeholder key={i} as={'div'} animation="glow">
                            <Placeholder style={{width: '7rem', height:"1.5rem"}} as="p" className="rounded border-secondary m-1 p-2"></Placeholder>
                        </Placeholder>                                       
                    ))                                                       
                }
            </Stack>                                         
            }
        </Container>
        <Container fluid className="pb-4" style={{backgroundColor: "rgba(0,0,0,0.2"}}>
            <Container>   
                <Row className="g-4 justify-content-center">
                    {                         
                        Array.from({ length: 25 }).map((_, i) => (  
                            <Col key={i} xs={12} sm={6} md={4} lg={3} xl={2}>
                            <Placeholder animation="wave" as={Card} style={{ width: '11.5rem', textAlign: 'center'}}>                                       
                                <Placeholder as={Card.Img} style={{height: '15rem', objectFit: 'cover'}} variant="top" />
                            </Placeholder>
                        </Col>                                   
                        ))    
                    }
                </Row>
            </Container>
        </Container>
        </>
    }
    //Je-li data načtena, zobrazí se uživatelům, jinak se zobrazuje zpráva o tom, že pro aktuální filtr neexistují žádná anime
    if(!isLoading) return( 
        <>
        <Container className="w-75 mt-4 bg-secondary p-3 rounded border border-secondary shadow-lg">
            <Stack direction="horizontal" className="flex-wrap">
                {
                allGenres.map((genre,index) => (
                    <Genre key={index} addGenre={()=>handleToggleGenre(genre)} genre={genre}/>
                ))     
                }
            </Stack>
        </Container>
        <Container className="mt-4 mb-4 p-2 border border-secondary rounded" style={{boxShadow: '0 0 20px -10px'}}>
            <Form>
                <Form.Group controlId="formSearch">
                    <Form.Control type="search" placeholder="Search your anime.." onChange={handleSearchChange}/>
                </Form.Group>
            </Form>
        </Container>
        <Container className="pb-4 pt-4 bg-secondary border border-secondary rounded d-flex text-center" style={containerStyle}>
            <Stack ref={animesRef} direction='horizontal'  gap={2} className="overflow-x-auto text-center" style={windowWidth > 800 ? wrapCenterStyle : nowrapStartStyle}
                >
                {
                    windowWidth < 800 && displayAnime.length > 0 && <ScrollHint />
                }
                {
                    displayAnime.map((anime) => {
                    return <Anime key={anime.id} anime={anime} animesOfInterest={animesOfInterest}/>
                })   
                }
                {
                    displayAnime.length === 0 && <h3 className="text-white">No animes for current filter</h3>
                }
            </Stack>
            {
                    windowWidth < 800 && displayAnime.length > 0 && 
                <div className="d-flex flex-column">
                    <Button onClick={() => handleArrowClick('left')} className="h-50 ms-2" style={{width: '50px'}}>
                        <ArrowBigLeft fill="white"/>
                    </Button>
                    <Button onClick={() => handleArrowClick('right')} className="h-50 ms-2 mt-1" style={{width: '50px'}}>
                        <ArrowBigRight fill="white"/>
                    </Button>
                </div>
            }
        </Container>
        </>
    )
}
export default Animes