
import noImage from "../../misc/NoImage.png"
import { Card} from "react-bootstrap";
import { Star } from "../svg-components/StarFavorite";
import { Link } from "react-router-dom";

const AnimeRating = ({userRating ,anime, animesOfInterest}) => {
  return (
      <div key={anime.id} className="p-0 position-relative">
      {
          <Star id={anime.id} active = {animesOfInterest?.includes(anime.id)}/>                                          
      }
      <Link style={{textDecoration: "none"}} to={`/anime/${anime.id}/`}>                               
          <Card style={{ width: '11.5rem', textAlign: 'center', border: "none"}} >
            <div style={{overflow: "hidden"}}>
                <div className="position-absolute" style={{color: "white", width: "100%", fontSize: "17pt" , alignSelf: "end", backgroundColor: 'rgba(0,0,0,0.6)', zIndex: "9999"}}>
                    {
                        userRating &&
                        (
                            userRating.rating + "/5"                     
                        )
                    }             
                </div>
                <Card.Img style={{height: '15rem', objectFit: 'cover'}} className="hvr-grow" src={anime.imageVersionRoute ? anime.imageVersionRoute : noImage} />
            </div>            
              <Card.Body style={{backgroundColor:  "rgba(255, 255, 255, 1)"}}>                                             
                  <Card.Title 
                  title={anime.title}
                  style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '1rem',
                  }}
                  >{anime.title}</Card.Title>
              </Card.Body>
          </Card>
      </Link>
    </div>
)}

export default AnimeRating