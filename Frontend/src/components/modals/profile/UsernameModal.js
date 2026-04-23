import { Modal, Form, Button} from 'react-bootstrap'
import useFormValidation from '../../hooks/useFormValidation';
const UsernameModal = ({show, close, edit}) => {

  const {values, errors, setValue, setErrors} = useFormValidation({
    username: ''
  });
  const validation = () => {
    const {username} = values;
    const errorObject = {...errors}
    if(!username){
      errorObject.username = "Username is required!";
    }
    if(username && (username.length < 3 || username.length > 20)){
      errorObject.username = "Username must be between 3 and 20 characters!";
    }
    setErrors(() => ({...errorObject}))
    return (Object.values(errorObject).every(value => value === undefined))
  }
  const handleEditUsername = () => {
    if(!validation()) return;
    const formData = new FormData();
    formData.append('username', values.username);
    edit(formData)
    close();
  }
  return (
    <Modal show={show} onHide={close} keyboard={false}>
          <Modal.Header closeButton style={{backgroundColor: "rgba(0,0,0,0.3)"}}>
            <Modal.Title>Edit username!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className='d-flex flex-column gap-2'>
              <Form.Label className='m-0'>Change Username</Form.Label>
              <Form.Text className='text-muted'>Username must be between 3 and 20 characters!</Form.Text>
              <Form.Control onChange={(e) => setValue('username', e.target.value)} placeholder='New username' isInvalid={!!errors.username}></Form.Control>
              <Form.Control.Feedback type='invalid'>{errors.username}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{backgroundColor: "rgba(0,0,0,0.4)"}}>
            <Button variant='secondary' onClick={close}>Close</Button>
            <Button variant='primary' onClick={handleEditUsername}>Edit</Button>
          </Modal.Footer>
      </Modal>
  )
}

export default UsernameModal