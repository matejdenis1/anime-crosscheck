
import { Modal, Button} from 'react-bootstrap'
const DeleteUserModal = ({show, close, deleteUser}) => {
  return (
    <Modal show={show} onHide={close} keyboard={false}>
          <Modal.Header closeButton style={{backgroundColor: "rgba(0,0,0,0.3)"}}>
            <Modal.Title>Delete User!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong>You are about to delete your profile:</strong>
            <ul>
                <li>Your favorites will be relocated to browser storage (You cannot access them elsewhere)</li>
                <li>Your ratings will be deleted!</li>
                <li>Your connection between users will be gone!</li>
            </ul>
          </Modal.Body>
          <Modal.Footer style={{backgroundColor: "rgba(0,0,0,0.4)"}}>
            <strong>Do you still want to proceed?</strong>
            <Button variant='secondary' onClick={close}>Close</Button>
            <Button variant='danger' onClick={() => {deleteUser(); close()}}>Delete</Button>
          </Modal.Footer>
    </Modal>
  )
}

export default DeleteUserModal