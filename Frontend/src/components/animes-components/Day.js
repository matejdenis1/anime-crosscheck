import { memo } from "react";
import { Badge } from "react-bootstrap";
import noImage from "../../misc/NoImage.png"
import Card from 'react-bootstrap/Card'
import Stack from 'react-bootstrap/Stack'
const Day = ({ animeList }) => {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    return (
        <>
        <Stack className=" border border-secondary align-items-center" direction='vertical' gap={2} style={{ minWidth: '200px'}}>
            {
                animeList.map((anime) => (
                    <Card key={anime.id} className="position-relative overflow-hidden rounded-0" style={{width: '12.2rem', zIndex: 2}}>
                        {
                            anime.status !== 'Ongoing' && <div className="position-absolute bg-warning text-center" style={{width: '170%', rotate: '47deg', transformOrigin: 'top left', zIndex: 1}}><strong>{anime.status}</strong></div>
                        }
                        <Badge bg="dark" className="position-absolute p-2 top-0 end-0 m-1">Episode {anime.episodeNumber}</Badge>
                        <Card.Img style={{height: '15rem', objectFit: 'cover'}} className="pe-none" variant="top" src={anime.imageVersionRoute || noImage} onError={(e) => {e.target.onerror = null; e.target.src = noImage}} />
                        <Card.Body>
                            <Card.Title
                            title={anime.title}
                            style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: 12,
                            }}
                            >{anime.title}</Card.Title>
                            <Card.Text>{new Intl.DateTimeFormat('en-US', options).format(new Date(anime.episodeDate))}</Card.Text>
                        </Card.Body>
                    </Card>
                ))
            }            
        </Stack>
        </>
    );
};

export default memo(Day);