import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Form, Container, Button, Stack, Image} from 'react-bootstrap'
import { AuthContext } from '../providers/AuthProvider'
import { useContext } from 'react'
import useFormValidation from '../hooks/useFormValidation'
import zerotwo from '../../misc/zerotwo.png'
import PasswordInput from '../misc/PasswordInput'

const Login = () => {

  const location = useLocation();
  const {login} = useContext(AuthContext)
  const {values, errors, setValue, setErrors} = useFormValidation({
    email: '',
    password: ''
  });
  const navigate = useNavigate()


  const loginUser = async () => {
    const formData = {
      email: values.email,
      password: values.password
    }
    const success = await login(formData)
    if(success) {
      navigate(location.state?.from?.pathname || '/')
    } else{
      setErrors((prev) => ({...prev, password: 'Bad credentials!'}))
    }
  };

  const validation = () => {
    const {password, email} = values;
    const errorObject = {...errors};
    if(!password){
      errorObject.password = 'Password is required!'
    }
    if(!email){
      errorObject.email = 'Email is required!'
    }
    setErrors(() => ({...errorObject}))
    return (Object.values(errorObject).every(value => value === undefined))
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if(!validation()) return;
    loginUser();
  }

  return (
    <Container className='text-white p-0 bg-dark d-flex flex-row align-items-center mt-3'>
      <Container className='w-50 d-none d-md-flex flex-column text-center border-end border-secondary'>
        <h1 className='position-absolute' style={{width: "12vw"}}>Welcome back!</h1>
        <Image loading='lazy' src={zerotwo}/>
      </Container>
      <Container className='d-flex flex-column bg-dark text-white rounded justify-content-center p-3 mt-2'>
        <h1> Login </h1>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" required placeholder="Enter email" isInvalid={errors.email} onChange={(e) => setValue('email', e.target.value)}/>
            <Form.Control.Feedback type='invalid'>
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <PasswordInput
              placeholder="Password"
              isInvalid={errors.password}
              onChange={e => setValue('password', e.target.value)}
            />
          </Form.Group>
          <Stack direction='vertical' className='text-end'>
            <Button onClick={handleLogin} className='align-self-center' style={{backgroundColor: "rgba(98,98,115,1)", borderColor: "rgba(98,98,115,1)"}} type="submit">
              Sign Me!
            </Button>
            <Container>
              <p className='m-0 align-self-middle'>Don't have an account?</p>
              <Link className='text-decoration-none' to={"/auth/register"} state={{from: location.state?.from}}>Register here!</Link>
            </Container>
          </Stack>
        </Form>
      </Container>
    </Container>
  )
}

export default Login