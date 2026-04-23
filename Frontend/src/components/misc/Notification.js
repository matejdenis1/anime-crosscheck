
import { Image} from 'react-bootstrap'
import { convertTimeToAgo } from './convertTimeToAgo'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import API_URL from "../../config/api";
const Notification = ({deleteNotification,notif}) => {
    //Konfigurace animace pro smazání notifikace
    const [fadeOut, setFadeOut] = useState(false);
    const handleDelete = () => {
        setTimeout(() => {
            deleteNotification();
        }, 1000)
        setFadeOut(true)
    }
    const episode = notif.action?.episode;
  return (
        <div className={fadeOut ? 'animate__animated animate__fadeOut d-flex flex-row flex-stretch border rounded border-black bg-white gap-4 mt-2' : 'animate__animated animate__fadeIn d-flex flex-row flex-stretch border rounded border-black bg-white gap-4 mt-2'}>
            {
                episode ? (
                    <Image className='ms-2 mt-2' width={50} height={50} rounded src={episode.image} alt={episode.title} style={{objectFit: 'cover'}} />
                ) : (
                    <Image className='ms-2 mt-2' width={50} height={50} roundedCircle src={`${API_URL}/api/users/avatar/${notif.user?.profileId}`} />
                )
            }
            <div className="d-flex flex-column align-self-center">
                {
                    episode ? (
                        <>
                            <strong>New episode released</strong>
                            <p className='mb-1'>
                                Episode {episode.episodeNumber} of{' '}
                                <Link to={`/anime/${episode.animeId}`}>{episode.title}</Link>{' '}
                                is out!
                            </p>
                        </>
                    ) : (
                        <>
                            <strong>{notif.user?.username}</strong>
                            {notif.action.added && <p>Added some anime to their favorites...</p>}
                            {notif.action.followed && <p>Started following you...</p>}
                            {notif.action.rated && <p>Rated an anime...</p>}
                        </>
                    )
                }
                <p className='text-muted' style={{fontSize: '0.8rem'}}>{convertTimeToAgo(notif.timestamp)}</p>
            </div>
            <div className='ms-auto'>
                <Trash2 className='m-2' cursor={'pointer'} color='red' style={{zIndex: '9999'}} onClick={handleDelete}/>
            </div>
        </div>
  )
}

export default Notification