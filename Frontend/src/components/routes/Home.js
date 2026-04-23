import { Container, Col, Row, Placeholder} from "react-bootstrap";
import { AnimeCarousels } from "../homepage-components/AnimeCarousels";
import Comments from "../comment-components/Comments";
import CommentPlaceholder from "../comment-components/CommentPlaceholder";
import useFetch from '../hooks/useFetch';
import useAnimes from "../hooks/useAnimes";
import { useQuery } from '@tanstack/react-query';
import API_URL from "../../config/api";

const Home = () => {
    const {animes} = useAnimes();
    //Získává doporučená anime na základě oblíbených
    const {data: recommended} = useQuery({
        //Neposílat požadavek pokud uživatel nemá oblíbené anime
        enabled: animes.length !== 0,
        queryKey: ['recommended', animes],
        queryFn: async () => {
            //Místo GET požadavku posíláme POST s ID oblíbených anime, aby backend mohl vrátit relevantní doporučení
            //Jelikož recommended je zamýšleno i pro nepřihlášené uživatele, musíme posílat ID oblíbených anime i pro nepřihlášené uživatele, aby měli také nějaká doporučení
            const response = await fetch(`${API_URL}/api/users/anime/recommended`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ animes })
            })
            if(!response.ok){
                throw new Error('Failed to fetch recommended animes')
            }
            return await response.json();
        },
        staleTime: 5*60*1000,
        gcTime: 5*60*1000
    })
    const {data: homepage, isLoading} = useFetch(`${API_URL}/api/homepage`, ['homePageData'], true)
    if(isLoading) return (
        <>
        <Container>
             <Row className="mt-2">
              <Col className="pt-2 m-auto" lg={4} style={{maxWidth: '400px'}}>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={8}  className='rounded mt-2' style={{height: '450px', width: '100%'}} />
                  </Placeholder>
              </Col>
              <Col className="pt-2 m-auto" lg={4} style={{maxWidth: '400px'}}>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={8} className='rounded mt-2' style={{height: '450px', width: '100%'}} />
                  </Placeholder>
              </Col>
              <Col className="pt-2 m-auto" lg={4} style={{maxWidth: '400px'}}>
                  <Placeholder as="div" animation="glow">
                    <Placeholder xs={8} className='rounded mt-2' style={{height: '450px', width: '100%'}} />
                  </Placeholder>
              </Col>
            </Row>
        </Container>
        <Container className="d-flex flex-row gap-3 justify-content-center pt-4">
            <CommentPlaceholder />
            <CommentPlaceholder />
            <CommentPlaceholder />
        </Container>       
        </>
    )
    return(
        <>
        <Container>
            <Row className="mt-2">
                {
                recommended?.length > 0 && <AnimeCarousels animes={recommended} header={"Recommended"}/>
                }
                <AnimeCarousels header={"Popular"} animes={homepage.popularAnimes}/>
                {homepage.todayReleases.length > 0 && <AnimeCarousels header={"Releasing Today"} animes={homepage.todayReleases}/>}
            </Row>    
        </Container>
        <Container>
        {
            homepage.recentRatings.length > 0 ? (<Comments source="homepage" comments={homepage.recentRatings}/>) : (
                <div className="text-white d-flex shadow-lg justify-content-center bg-dark mt-4 rounded" style={{height: '100px'}}>
                    <p className="align-self-center m-0" style={{fontSize: '2rem', fontWeight: '500'}}>There are no recent ratings!</p>
                </div>
            )
        }
        </Container>
        
        </>
    );

}
export default Home;