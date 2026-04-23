import { useState, useContext} from 'react'
import { StarRating } from '../svg-components/StarRating';
import { Container,Modal,Stack,Form,Button } from 'react-bootstrap';
import usePost from "../hooks/usePost"
import API_URL from "../../config/api";
import { AuthContext } from '../providers/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
const RatingModal = ({show, anime, hide}) => {

    const [rating, setRating] = useState(-1);
    const [comment, setComment] = useState("");
    const [warning, setWarning] = useState(false);
    const {user} = useContext(AuthContext);
    const queryClient = useQueryClient();
    //Zde se invaliduje cache, aby reakce na ostatních stránkach byla aktualizována.
    const onRated = () => {
      if(user?.profileId){
        queryClient.invalidateQueries({queryKey: ['userProfile', user.profileId]});
      }
      queryClient.invalidateQueries({queryKey: ['homePageData']});
      hide();
    }
    const {handlePost: rateAnime} = usePost(`${API_URL}/api/users/rating`, onRated, ['anime', anime.id])

    const handleAnimeRating = () => {
      if(rating === -1){
        toast.error("Please select a rating atleast one star before submitting!")
        return
      }
      if(comment.length > 150){
        setWarning(true)
        return
      }
      const body = JSON.stringify({
            "animeId": anime.id,
            "rating": rating,
            "comment": comment
          })
      rateAnime.mutate({body});
    }

    const handleSetRating = (rating) => {
      setRating(rating);
    } 

  return (
    <Modal show={show} onHide={hide} keyboard={false}>
          <Modal.Header closeButton style={{backgroundColor: "rgba(0,0,0,0.3)"}}>
            <Modal.Title>Rate {anime.title}!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Stack direction='horizontal' className='justify-content-center' style={{backgroundColor: "rgba(0,0,0,0.2)"}}>
              <StarRating handleSetRating={handleSetRating} rating={rating} />
            </Stack>
            <Form className='pt-4'>
              <Form.Group>
                <Form.Label>Add your comment.</Form.Label>
                <Form.Control style={{borderColor: warning ? "red" : "grey"}} as="textarea" onChange={(e) => { setComment(e.target.value); setWarning(false)}} type='text' placeholder='My thoughts on this anime are...'></Form.Control>
                <Container className='d-flex' fluid>
                  <Form.Label style={{color: warning ? "red" : 'grey'}}>Limit - 150 characters</Form.Label>
                  <Form.Label className='ms-auto pe-4' style={{color: comment.length > 150 ? "red" : "grey"}}>{comment.length} / 150</Form.Label>
                </Container>
                
              </Form.Group>
              
            </Form>
          </Modal.Body>
          <Modal.Footer style={{backgroundColor: "rgba(0,0,0,0.4)"}}>
            <Button variant='secondary' onClick={hide}>Close</Button>
            <Button variant='primary' onClick={handleAnimeRating}>Rate</Button>
          </Modal.Footer>
      </Modal>
  )
}

export default RatingModal