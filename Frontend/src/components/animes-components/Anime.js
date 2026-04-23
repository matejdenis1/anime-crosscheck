import {useState, memo} from "react"
import noImage from "../../misc/NoImage.png"
import { Card} from "react-bootstrap";
import { Star } from "../svg-components/StarFavorite";
import { Link } from "react-router-dom";

const Anime = ({anime, animesOfInterest}) => {

  const [isHovered, setIsHovered] = useState();
  return (
    <div key={anime.id} className="position-relative">
      {
        <Star id={anime.id} active = {animesOfInterest.includes(anime.id)}/>                               
      }
      <Link style={{textDecoration: "none"}} to={`/anime/${anime.id}/`}>                               
          <Card style={{ width: '11.5rem', textAlign: 'center', border: "none"}}  onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} >
            <div style={{overflow: "hidden"}}>
              <Card.Img style={{height: '15rem', objectFit: 'cover', transition: "transform 0.3s ease-in-out", transform: isHovered ? "scale(1.2)" : "scale(1)", transformOrigin: "center center"}} variant="top" src={anime.imageVersionRoute || noImage} onError={(e) => {e.target.onerror = null; e.target.src = noImage}} />
            </div>            
              <Card.Body style={{backgroundColor: isHovered ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 1)"}}>                                             
                  <Card.Title 
                  title={anime.title}
                  style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: 12,
                  }}
                  >{anime.title}</Card.Title>
              </Card.Body>
          </Card>
      </Link>
    </div>
  )
}

export default memo(Anime)