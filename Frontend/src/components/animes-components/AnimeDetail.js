import { useContext, useState} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Star } from '../svg-components/StarFavorite'
import { Image, Col, Row, Stack, Badge, Button} from 'react-bootstrap'
import { AuthContext } from '../providers/AuthProvider'
import {Star as StarRating} from 'lucide-react'
import useAnimes from '../hooks/useAnimes'
import RatingModal from '../modals/RatingModal'
import SeeMoreModal from '../modals/SeeMoreModal'
import API_URL from "../../config/api";
import DOMPurify from 'dompurify';
const AnimeDetail = ({anime}) => {

    const [modalShow, setModalShow] = useState(false);
    const location = useLocation()
    const {user, isAuthenticated} = useContext(AuthContext)
    const {animes: animesOfInterest} = useAnimes();
    const followsLikesAnime = user?.follows.filter(follow => follow.animes && follow.animes.includes(anime.id)) 
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const [showModal, setShowModal] = useState(false);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };

    // Bezpečné zobrazení popisu anime bez HTML tagů
    const description = DOMPurify.sanitize(anime.description, {ALLOWED_TAGS: [], ALLOWED_ATTR: []})
    return (
      <>
        {/* Modal, který ukazuje osoby, které by vás mohly zajímat, jestli osoby, které mají toto anime mezi oblíbenými je víc jak 3*/}
        <SeeMoreModal 
          show={showModal} 
          handleClose={() => setShowModal(false)}
          title={"People you might know"}
          content={followsLikesAnime}/>
        <RatingModal show={modalShow} hide={() => setModalShow(false)} anime={anime} />
          <Row className='mt-4' xs={1} sm={1} md={1} lg={2}>
          <Col lg={4}> 
            <Stack className='position-relative overflow-hidden'>
              <Star 
                id={anime.id} active={animesOfInterest.some((userAnime) => userAnime === anime.id)}
              />  
              <Image 
                src={anime.imageVersionRoute} 
                className='w-100'  rounded style={{
                  objectFit: 'cover',
                  maxHeight: '450px',
                  height: 'auto'
                }}
              />
              <div className='position-absolute text-center bottom-0 bg-dark text-white w-100'>
                <h4 className='mb-2' style={{fontSize: '1rem'}}>{anime.title}</h4>
              </div>
              <div className='position-absolute text-center end-0 top-0 m-2 rounded text-white'>
                <Badge className='d-flex' bg='dark' style={{fontSize: '1rem'}}>
                  {
                    Array.from({length: 5}).map((_,i) => (<StarRating key={i} fill={i < anime.rating ? 'yellow' : 'transparent'} stroke='yellow' strokeWidth={1}/>))
                  }
                </Badge>
              </div>
            </Stack>     
          </Col>
          <Col className='d-flex flex-column'>
              <div className='overflow-hidden border border-dark rounded p-2 bg-light'>
                <h3>Description</h3>
                <p className='d-inline-block'>{description}</p>
              </div>
              {
                isAuthenticated && followsLikesAnime.length > 0 && <div className='d-flex flex-row'>
                  <div className='mt-2 position-relative' style={{height: '40px', width: '80px'}}>
                    {
                      followsLikesAnime.slice(0,3).map((user, i) => 
                        (<Image className='position-absolute' title={user.username} style={{left: `${20*i}px`, zIndex: -i}} key={user._id} src={`${API_URL}/api/users/avatar/${user.profileId}`} rounded width={40} height={40}/>)
                      )
                    }
                  </div>
                  <div className='align-self-end m-0 p-0'>
                    {
                      followsLikesAnime.slice(0,3).map((user, i) => {
                        return <Link key={user._id} className='me-1 text-dark' to={`/profiles/${user.profileId}`}><strong>{user.username}</strong>{i < Math.min(followsLikesAnime.length, 3) -1 ? ',' : ''} </Link>
                      })
                    }
                    {
                     followsLikesAnime.length > 3 && <strong className='text-primary' onClick={() => setShowModal(true)}>and more </strong> 
                    }
                    <strong >Favored this anime</strong>
                  </div>
                </div>
              }
              <div className='mt-auto'>
                  <Stack direction='horizontal' className='flex-wrap' gap={2}>
                    {
                      anime.genres.map((genre, index) => {
                        return <div key={index} className='bg-dark text-white rounded mt-2 p-2'>{genre}</div>
                      })
                    }
                  </Stack>
                  <Stack direction='vertical'>
                    <div className='bg-success text-white rounded mt-2 d-flex align-items-center justify-content-center w-50' style={{height: '50px'}}>
                      <h2 className='mb-0'>{anime.status}</h2>
                    </div>
                    <div className='bg-light text-dark rounded mt-2 d-flex align-items-center justify-content-center' style={{height: '50px',  width: '50%'}}>
                      <h3 style={{fontSize: '1.5rem'}} className='mb-0'>Episode: {anime.episodeNumber}</h3>
                    </div>
                    <div className='bg-warning text-dark rounded mt-2 d-flex align-items-center justify-content-center' style={{height: '50px', width: '50%'}}>
                      <h3 style={{fontSize: '1.5rem'}} className='mb-0'>{days[new Date(anime.episodeDate).getDay()] } - {new Intl.DateTimeFormat('en-US', options).format(new Date(anime.episodeDate))}</h3>
                    </div>
                  </Stack>
                  {
                    isAuthenticated ? <Button variant="primary"  className='mt-2' onClick={() => setModalShow(true)}>Rate me!</Button> : <div>
                    <Button variant="primary" className='mt-2' disabled>Rate me!</Button>
                    <strong className='ps-2 m-0'>If you would like to rate this anime.. please <Link className='text-decoration-none' to={"/auth/register"} state={{from: location}} >register</Link> or <Link className='text-decoration-none' to={"/auth/login"} state={{from: location}}>sign in</Link></strong>
                    </div>
                  }
              </div>
          </Col>
        </Row> 
      </>
        )}
    
export default AnimeDetail