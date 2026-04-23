import { Modal, Form, Button, Stack} from 'react-bootstrap'
import PasswordInput from '../../misc/PasswordInput';
import useFormValidation from '../../hooks/useFormValidation';
const PasswordModal = ({show, close, edit}) => {

  //Minimálně osm znaků, alespoň jedno velké písmeno, alespoň jedno číslo:
  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  const {values, errors, setValue, setErrors} = useFormValidation({
    oldPassword: '',
    newPassword: '',
    reNewPassword: ''
  });

  const validation = () => {
    const {oldPassword, newPassword, reNewPassword} = values;
    const errorObject = {...errors}
    if(!oldPassword){
      errorObject.oldPassword = "Old password is required!";
    }
    if(!newPassword){
      errorObject.newPassword = "New password is required!";
    }
    if(!reNewPassword){
      errorObject.reNewPassword = "Re-New password is required!";
    }
    if(newPassword !== reNewPassword){
      errorObject.reNewPassword = "Passwords need to match!";
      errorObject.newPassword = "Passwords need to match!";
    }
    if(!PASSWORD_REGEX.test(newPassword)){
      errorObject.newPassword = "Passwords are not within requirements!";
    }
    if(oldPassword && newPassword && oldPassword === newPassword){
      errorObject.newPassword = "New password must be different from old password!";
    }
    setErrors(() => ({...errorObject}))
    return (Object.values(errorObject).every(value => value === undefined))
  }

  //Zde se používá FormData, protože backend očekává multipart/form-data kvůli možnosti přidat i profilový obrázek
  //, ale v tomto případě se posílají pouze textová data.
  const handleEditPassword = () => {
    if(!validation()) return;
    const formData = new FormData();
    const {oldPassword, newPassword} = values;
    formData.append('oldPassword', oldPassword)
    formData.append('newPassword', newPassword)
    edit(formData)
  }


  return (
    <Modal show={show} onHide={close} keyboard={false}>
          <Modal.Header closeButton style={{backgroundColor: "rgba(0,0,0,0.3)"}}>
            <Modal.Title>Edit password!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className='d-flex flex-column gap-2'>
              <Form.Label>Change Password</Form.Label>
              <Form.Text className='text-muted'>Password must be at least 8 characters long and contain at least one uppercase letter!</Form.Text>
              <Stack direction='vertical' gap={3}>
              <PasswordInput
                value={values.oldPassword}
                isInvalid={errors.oldPassword}
                onChange={e => setValue('oldPassword', e.target.value)}
                placeholder='Old password'
              />
              <PasswordInput
                value={values.newPassword}
                isInvalid={errors.newPassword}
                onChange={e => setValue('newPassword', e.target.value)}
                placeholder='New password'
              />
              <PasswordInput
                value={values.reNewPassword}
                isInvalid={errors.reNewPassword}
                onChange={e => setValue('reNewPassword', e.target.value)}
                placeholder='Re-New password'
              />
              </Stack>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{backgroundColor: "rgba(0,0,0,0.4)"}}>
            <Button variant='secondary' onClick={close}>Close</Button>
            <Button variant='primary' onClick={handleEditPassword}>Edit</Button>
          </Modal.Footer>
    </Modal>
  )
}

export default PasswordModal