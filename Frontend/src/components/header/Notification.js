
import {convertTimeToAgo} from "../misc/convertTimeToAgo";
import  {Image, DropdownItem} from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from "lucide-react";
import API_URL from "../../config/api";
const Notification = ({notif, deleteNotification}) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const episode = notif.action?.episode;
    const handleNotifClick = () => {
        deleteNotification();
        if (episode) {
            navigate(`/anime/${episode.animeId}`)
        } else if (notif.user?.profileId) {
            queryClient.invalidateQueries({queryKey: ['userProfile', notif.user.profileId]})
            navigate(`/profiles/${notif.user.profileId}`)
        }
    }

  return <>
  <div className="d-flex flex-row">
    <DropdownItem draggable={false} key={notif._id} className="d-flex align-items-center justify-content-between flex-row" onClick={handleNotifClick}>
                <div className="d-flex flex-row gap-2 pe-none" >
                    {
                        episode ? (
                            <>
                                <Image width={60} height={50} rounded src={episode.image} alt={episode.title} style={{objectFit: 'cover'}} />
                                <div className="d-flex row gap-0">
                                    <p className="m-0">Episode {episode.episodeNumber} of {episode.title} is out!</p>
                                    <p className="user-select-none text-muted m-0">{convertTimeToAgo(notif.timestamp)}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="d-flex gap-2">
                                    <Image width={30} height={30} roundedCircle src={`${API_URL}/api/users/avatar/${notif.user?.profileId}`} />
                                    <p>{notif.user?.username}</p>
                                </div>
                                <div className="d-flex row gap-0">
                                    {notif.action.added && <p className="m-0">Added some anime to their favorites...</p>}
                                    {notif.action.followed && <p className="m-0">Started following you...</p>}
                                    {notif.action.rated && <p className="m-0">Rated an anime...</p>}
                                    <p className="user-select-none text-muted m-0">{convertTimeToAgo(notif.timestamp)}</p>
                                </div>
                            </>
                        )
                    }
                </div>
        </DropdownItem>
        <Trash2 className="m-2" width={30} height={30} cursor={'pointer'} color="red" style={{zIndex: '9999'}} onClick={() => deleteNotification()}/>
  </div>

    </>
}

export default Notification