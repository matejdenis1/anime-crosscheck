import { Toast, CloseButton} from 'react-bootstrap'
import {useState, useEffect, useContext, memo} from 'react'
import {convertTimeToAgo} from '../misc/convertTimeToAgo';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import usePost from '../hooks/usePost';
import { useQueryClient } from '@tanstack/react-query';
import API_URL from "../../config/api";
const CommentProfile = ({comment, unMount}) => {

    const queryClient = useQueryClient();
    const { profileId } = useParams();
    //Updatuje se cache aby se zase načetli komentáře, tam kde byly zobrazeny
    const refreshComments = () => {
      queryClient.invalidateQueries({queryKey: ['anime', comment.animeId]})
      queryClient.invalidateQueries({queryKey: ['userProfile', profileId]})
      queryClient.invalidateQueries({queryKey: ['homePageData']})
      unMount();
    }
    const [canEdit, setCanEdit] = useState(false);
    const {user, isAuthenticated: isAuth, userLoading} = useContext(AuthContext)
    const {handlePost: deleteComment} = usePost(`${API_URL}/api/users/rating/delete/`, () => refreshComments(), [])

    useEffect(() => {
      if (isAuth && !userLoading) {
        setCanEdit(user.profileId === profileId);
      }
    }, [isAuth, userLoading, user?.profileId, profileId]);

  return (
    <Toast className='mt-4 flex-shrink-0 animate__animated animate__fadeInDown'>
        <Toast.Header closeButton={false} >   
          <small className="w-50">{convertTimeToAgo(comment.updatedAt)}</small>
          <Link to={"/anime/"+comment.animeId} title={comment.animeName} className='w-50 text-decoration-none text-dark' style={{whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',}}>{comment.animeName}</Link>
          {
            canEdit && <CloseButton onClick={() => deleteComment.mutate({params: comment._id})} />
          }
        </Toast.Header>
      <Toast.Body>{comment.message}</Toast.Body>
      <div className='border-top border-grey bg-secondary d-flex justify-content-center'> {Array.from({length: comment.rating}).map((_, i)=> {
            return <svg key={i} width="30" height="30" viewBox="0 0 24 24" fill="yellow" stroke='yellow' >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
      })} </div>
    </Toast>
  )
}

export default memo(CommentProfile)