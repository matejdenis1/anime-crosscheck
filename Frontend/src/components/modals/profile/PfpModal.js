import {useState} from 'react'
import { Modal, Form, Button} from 'react-bootstrap'
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
const PfpModal = ({show, close, edit, setPfp}) => {
  
  const [file, setFile] = useState();
  // Komprese obrázku před odesláním do databáze
  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      try{
          const compressedImage = await imageCompression(file, {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 200,
            useWebWorker: true
          })
          setFile(compressedImage)
          setPfp(URL.createObjectURL(compressedImage))
      } catch(err){
        toast.error(err.message)
        e.target.value = ''
      }
  }
  const handleEditImage = () => {
    const formData = new FormData();
    formData.append('avatar', file)
    close();
    edit(formData)
  }

  return (
    <Modal show={show} onHide={close} keyboard={false}>
        <Modal.Header closeButton style={{backgroundColor: "rgba(0,0,0,0.3)"}}>
        <Modal.Title>Edit profile picture!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form.Group className='d-flex flex-column gap-2'>
            <Form.Label>Change avatar</Form.Label>
            <Form.Control type="file" accept='image/*' onChange={handleImageUpload}/>
        </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{backgroundColor: "rgba(0,0,0,0.4)"}}>
        <Button variant='secondary' onClick={close}>Close</Button>
        <Button variant='primary' disabled={file === undefined} onClick={handleEditImage}>Edit</Button>
        </Modal.Footer>
    </Modal>
  )
}

export default PfpModal