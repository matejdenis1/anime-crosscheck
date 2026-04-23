import { Badge, Carousel, Col, Image} from "react-bootstrap"
import { Link } from "react-router-dom"
import {Star as StarRating} from 'lucide-react'
import { ArrowLeft, ArrowRight } from "lucide-react"
import '../../styles/custom.css'
export const AnimeCarousels = ({header, animes}) => {
  const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
  return (
    <Col className="pt-2 m-auto" lg={4} style={{maxWidth: '400px'}}>
      <div className="bg-dark" style={{height: '35px'}}>
        <p className="text-white text-center" style={{fontSize: '1.5rem'}}>{header}</p>
      </div>
      <Carousel variant="dark" prevIcon={<ArrowLeft width={50} height={50}/>} nextIcon={<ArrowRight width={50} height={50}/>}>
        {
            animes.map(anime => {
                return (
                <Carousel.Item className="position-relative" style={{height: '450px'}} key={anime.id}>
                  {
                    header ==='Releasing Today' && <div className="w-50 position-absolute text-center rounded" style={{backgroundColor: 'rgba(255,255,255,0.9)', left: '50%',top: '5%', transform: 'translateX(-50%)'}}>
                        <h2>Episode: {anime.episodeNumber}</h2>
                      </div>
                  }
                  {
                    header ==='Popular' && <div className="position-absolute text-center rounded" style={{backgroundColor: 'rgba(97, 223, 97, 0.9)', left: '50%',top: '5%', transform: 'translateX(-50%)'}}>
                        <Badge className='d-flex' bg='dark'>
                          {
                            Array.from({length: 5}).map((_,i) => (<StarRating width={40} height={40} key={i} fill={i < anime.rating ? 'yellow' : 'transparent'} stroke='yellow' strokeWidth={1}/>))
                          }
                        </Badge>
                      </div>
                  }
                  {
                    header ==='Recommended' && <div className="w-50 position-absolute bg-dark text-center rounded p-2" style={{backgroundColor: 'rgba(255,255,255,0.9)', left: '50%',top: '5%', transform: 'translateX(-50%)'}}>
                        {

                          anime.genres.map((genre) => {
                            return <Badge key={genre} className="m-1" bg="white" text="black">{genre}</Badge>
                          })
                        }
                      </div>
                  }
                    <Link to={'/anime/'+anime.id}><Image src={anime.imageVersionRoute} className="d-block w-100 h-100"/></Link>
                    <Carousel.Caption className="bg-light border rounded p-2">
                      <h2 style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: '1rem'
                          }} title={anime.title}>{anime.title}
                        </h2>
                        {header === 'Releasing Today' && <h3 className="border-top border-dark">{anime?.episodeDate && new Intl.DateTimeFormat('en-US', options).format(new Date(anime.episodeDate))}</h3>}
                    </Carousel.Caption>
                </Carousel.Item>
                  )})
        }
      </Carousel>
    </Col>
    
  )

}