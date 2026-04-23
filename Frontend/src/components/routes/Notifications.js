import { Button, Container, Stack } from 'react-bootstrap'
import { useContext} from 'react';
import { NotificationContext } from '../providers/NotificationProvider';
import Notification from '../misc/Notification'
import usePost from '../hooks/usePost';
import API_URL from "../../config/api";
const Notifications = () => {
  const { notifications, setNotifications} = useContext(NotificationContext)
  
  const {handlePost: deleteNotification} = usePost(`${API_URL}/api/users/notification/delete`, 
    (data, variables) => setNotifications(prev => prev.filter(n => !JSON.parse(variables.body).ids.includes(n._id))),
    [])

  return (
    <Container className='w-50'>
      {
        notifications.length > 0 ? (
          <>
            <Button className='mt-2 position-sticky' variant='danger' onClick={() => deleteNotification.mutate({body: JSON.stringify({ids: notifications.map(notif => notif._id)})})}>Delete All</Button>
            <Stack direction='vertical'>
              {
                [...notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))].map(notif => {
                  return <Notification key={notif._id} notif={notif} deleteNotification={() => deleteNotification.mutate({body: JSON.stringify({ids: notif._id})})}/>
                })
              }
            </Stack>
          </>) :
          (
            <div className='w-100 bg-dark text-white mt-4 rounded text-center justify-content-center d-flex' style={{height: '100px'}}>
              <strong className='align-self-center' style={{fontSize: '2rem'}}>There are no new notifications</strong>
            </div>
          )
      }
      
    </Container>
)}

export default Notifications