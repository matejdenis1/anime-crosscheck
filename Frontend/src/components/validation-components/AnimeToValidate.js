import { useState } from 'react'
import { Button, Container, Image, FormControl, Row, Col} from 'react-bootstrap'
const AnimeToValidate = ({anime, verifyAnime}) => {

  const handleVerifyAnime = () => {
    
    const formData = new FormData();    
    formData.append('id', anime.id)
    formData.append('title', title || anime.title);
    formData.append('romaji', romaji || anime.romaji);
    formData.append('description', description || anime.description);
    formData.append('english', english || anime.english);
    formData.append('native', native || anime.native);
    formData.append('imageVersionRoute', imageVersionRoute || anime.imageVersionRoute);
    formData.append('status', status || anime.status);
    formData.append('genres', genres || anime.genres);
    formData.append('episodeNumber', episode || anime.episodeNumber);
    formData.append('episodeDate', episodeDate || anime.episodeDate);
    formData.append('verified', true)
    verifyAnime(formData);
  }

  const [title, setTitle] = useState();
  const [romaji, setRomaji] = useState();
  const [description, setDescription] = useState();
  const [english, setEnglish] = useState();
  const [native, setNative] = useState();
  const [imageVersionRoute, setImageVersionRoute] = useState();
  const [status, setStatus] = useState();
  const [genres, setGenres] = useState();
  const [episode, setEpisode] = useState();
  const [episodeDate, setEpisodeDate] = useState()

  return (
    <>
      <Container className='p-2 rounded' style={{border: '2px solid', boxShadow: '0 0 20px -10px', backgroundColor: '#77838f'}}>
        <Row sm={1} md={2}>
          <Col>
            <strong>Title</strong>
            <FormControl value={title === undefined ? anime.title : title} onChange={(e) => setTitle(e.target.value)}></FormControl>

            <strong>English</strong>
            <FormControl value={english === undefined ? anime.english : english} onChange={(e) => setEnglish(e.target.value)}></FormControl>

            <strong>Romaji</strong>
            <FormControl value={romaji === undefined ? anime.romaji : romaji} onChange={(e) => setRomaji(e.target.value)}></FormControl>

             <strong>Native</strong>
            <FormControl value={native === undefined ? anime.native : native} onChange={(e) => setNative(e.target.value)}></FormControl>
          </Col>
          <Col>
            <strong>Description</strong>
            <FormControl  as={'textarea'} placeholder='Description....' style={{minHeight: '89%'}} value={description === undefined ? anime.description : description} onChange={(e) => setDescription(e.target.value)}></FormControl>
          </Col>
        </Row>
        <Row className='pt-2'>
          <Col >
            <strong>Image Route</strong>
            <FormControl value={imageVersionRoute === undefined ? anime.imageVersionRoute : imageVersionRoute} onChange={(e) => setImageVersionRoute(e.target.value)}></FormControl>

            <strong>Status</strong>
            <FormControl value={status === undefined ? anime.status : status} onChange={(e) => setStatus(e.target.value)}></FormControl>

            <strong>Genres</strong>
            <FormControl value={genres === undefined ? anime.genres : genres} onChange={(e) => setGenres(e.target.value)}></FormControl>
            <strong>Episode Number</strong>
            <FormControl value={episode === undefined ? anime.episodeNumber : episode} onChange={(e) => setEpisode(e.target.value)}></FormControl>

            <strong>Episode Date</strong>
            <FormControl value={episodeDate === undefined ? anime.episodeDate : episodeDate} onChange={(e) => setEpisodeDate(e.target.value)}></FormControl>
          </Col>
          <Col>
            <Image className='rounded border border-dark' style={{height: '350px', width: '250px'}} src={imageVersionRoute === undefined ? anime.imageVersionRoute : imageVersionRoute} alt='preview'/>
          </Col>
        </Row>
        <Button onClick={handleVerifyAnime} className='hvr-grow w-50'>Verify</Button>
      </Container>
      
  </>
  )
}

export default AnimeToValidate