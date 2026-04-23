import { Container} from 'react-bootstrap';
import {useParams } from 'react-router-dom'
import AnimeDetail from '../animes-components/AnimeDetail';
import Comments from '../comment-components/Comments';
import AnimeDetailPlaceholder from '../animes-components/AnimeDetailPlaceholder';
import useFetch from '../hooks/useFetch';
import API_URL from "../../config/api";
const Detail = () => {
    const { id } = useParams();
    const {data: anime, isLoading, isError} = useFetch(`${API_URL}/api/anime/${id}`, ['anime', id], true)

  if(isLoading){
    return <Container>
      <AnimeDetailPlaceholder />
    </Container>
  }
  if(isError || !anime){
    return <Container className="text-center mt-5">
      <h3>Failed to load anime details.</h3>
    </Container>
  }
  return (
      <>
        <Container >
          <AnimeDetail anime={anime}/>
        </Container>
        <Comments source='anime' comments={anime.comments} />
      </>
  )
}

export default Detail