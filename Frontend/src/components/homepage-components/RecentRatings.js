import { memo } from 'react';
import { Toast } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {convertTimeToAgo} from '../misc/convertTimeToAgo';
import API_URL from "../../config/api";

export const RecentRatings = memo(({rating}) => {

  return (
    <>
    <Toast className='flex-shrink-0'>
        <Toast.Header closeButton={false} style={{backgroundColor: "rgba(0,0,0,0.3)"}}>
            <img width={25} height={25} src={`${API_URL}/api/users/avatar/`+rating.user.profileId} className='rounded me-2' alt=''/>
            <Link to={`/profiles/`+rating.user.profileId} className='me-auto text-decoration-none text-white'>{rating.user.username}</Link>
            <small className='text-white'>{convertTimeToAgo(rating.updatedAt)}</small>
        </Toast.Header>
        <Toast.Body>{rating.message}</Toast.Body>
        <div className='bg-secondary text-center'>
        <Link to={`/anime/`+rating.animeId} className='text-decoration-none text-white d-block' style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '1rem'}}
          >{rating.animeName}</Link>
        </div>
        <div className='d-flex justify-content-center ' style={{backgroundColor: "rgba(0,0,0,0.7)", bottom: 0}}> {Array.from({length: rating.rating}).map((_, i)=> {
          return <svg key={i} width="30" height="30" viewBox="0 0 24 24" fill="yellow" stroke='yellow' >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
          })} </div>
    </Toast>
    </>
  )
})
