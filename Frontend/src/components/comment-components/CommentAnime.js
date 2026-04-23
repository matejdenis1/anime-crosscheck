import { memo } from 'react'
import { Toast } from 'react-bootstrap'
import { Link } from 'react-router-dom';
import {convertTimeToAgo} from '../misc/convertTimeToAgo';
import API_URL from "../../config/api";
const CommentAnime = ({comment}) => {
  return (
    (
        <Toast className='animate__animated animate__fadeInDown'>
            <Toast.Header closeButton={false}>
                <img width={25} height={25} src={`${API_URL}/api/users/avatar/`+comment.user.profileId} className='rounded me-2' alt=''/>
                <Link to={`/profiles/`+comment.user.profileId} className='me-auto text-decoration-none'>{comment.user.username}</Link>
                <small>{convertTimeToAgo(comment.updatedAt)}</small>
            </Toast.Header>
            <Toast.Body>{comment.message}</Toast.Body>
            <div className='border-top border-grey bg-secondary d-flex justify-content-center'> {Array.from({length: comment.rating}).map((_, i)=> {
                return <svg key={i} width="30" height="30" viewBox="0 0 24 24" fill="yellow" stroke='yellow' >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
            })} </div>
        </Toast>
    ) 
    
  )
}

export default memo(CommentAnime)