import { Form, Container, Button, Image, Stack} from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useFormValidation from '../hooks/useFormValidation';
import { profanities } from 'profanities';
import validator from 'validator'
import { useContext, useEffect, useState} from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { useDebouncedCallback } from '@tanstack/react-pacer';
import API_URL from "../../config/api";
import zerotwo from '../../misc/zerotwo.png'
import PasswordInput from '../misc/PasswordInput';

const Register = () => {

const location = useLocation();
//Regex pro validaci hesla - musí být alespoň 8 znaků dlouhé a musí obsahovat alespoň jedno velké písmeno a jedno číslo
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const {values, errors, setValue, setErrors} = useFormValidation({
  username: '',
  email: '',
  password: '',
  rePassword: ''
});
const [emailExists, setEmailExists] = useState(false);
const [profileIdExists, setProfileIdExists] = useState(false);

//Kontrola jestli email nebo profileId už neexistuje v databázi, s debounce pro snížení počtu requestů
const isProfileIdTaken = useDebouncedCallback(async (profileId) => {
    const response = await fetch(`${API_URL}/api/users/check-profileId`, {
      method: 'POST',
      body: JSON.stringify({profileId}),
      headers: {'Content-Type': 'application/json'}
    })
    const data = await response.json();
    setProfileIdExists(data.exists);
  }, {wait: 1000});

const isEmailTaken = useDebouncedCallback(async (email) => {
    const response = await fetch(`${API_URL}/api/users/check-email`, {
      method: 'POST',
      body: JSON.stringify({email}),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    setEmailExists(data.exists);
}, {wait: 1000});


const handleEmailChange = async (e) => {
  setEmailExists(false);
  const email = e.target.value;
  setValue('email', email);
  if(!validator.isEmail(email)){
    return
  }
  isEmailTaken(email);
}

const handleProfileIdChange = (e) => {
  setProfileIdExists(false);
  const profileId = e.target.value;
  setValue('profileId', profileId);
  if(profileId.length < 3 || profileId.length > 20){
    return
  }
  isProfileIdTaken('@' + profileId);
}

useEffect(() => {
  if(emailExists){
    setErrors((prev) => ({...prev, email: "Email is already taken!"}))
  } else {
    setErrors((prev) => ({...prev, email: undefined}))
  }
}, [emailExists, setErrors])

useEffect(() => {
  if(profileIdExists){
    setErrors((prev) => ({...prev, profileId: "ProfileId is already taken!"}))
  } else {
    setErrors((prev) => ({...prev, profileId: undefined}))
  }
}, [profileIdExists, setErrors])

const {register} = useContext(AuthContext)
const navigate = useNavigate();

//Kontrola vulgárních slov ve jméně
const isUsernameAllowed = (username) => {
  const lower = username.toLowerCase();
  return !profanities.some(word => lower.includes(word));
};
const validation = () => {
  const {email, username, password, rePassword, profileId} = values;
  const errorObject = {}
  if(emailExists) errorObject.email = "Email is already taken!";
  if(profileIdExists) errorObject.profileId = "ProfileId is already taken!";
  if(profileId?.length < 3 || profileId?.length > 20){
      errorObject.profileId = "ProfileId must be between 3 and 20 characters!";
  }
  if(!profileId){
    errorObject.profileId = "ProfileId is required!";
  }
  if(username && (username.length < 3 || username.length > 20)){
    errorObject.username = "Username must be between 3 and 20 characters!";
  }
  if(!validator.isEmail(email)){
    errorObject.email = "Email is in wrong format!";
  }
  if(!isUsernameAllowed(username)){
    errorObject.username = "Username contains explicit language!";
  }
  if(password !== rePassword){
    errorObject.rePassword = "Passwords need to match!";
    errorObject.password = "Passwords need to match!";
  }
  if(!PASSWORD_REGEX.test(password)){
    errorObject.password = "Passwords are not within requirements!";
  }
  if(!password){
    errorObject.password = "Password is required!";
  }
  if(!email){
    errorObject.email = "Email is required!";
  }
  if(!username){
    errorObject.username = "Username is required!";
  }
  setErrors(() => ({...errorObject}))
  return (Object.values(errorObject).every(value => value === undefined))
}
  const handleRegister = async (event) => {
    event.preventDefault();
    if(!validation()){
      return
    }

    const {email, username, password, profileId} = values;
    const animes = localStorage.getItem('animes');
    const formData = {
      email, username, password, profileId, animes
    }
    const response = await register(formData)

    
    //Kontrola kdyby nastala situace, kdy uživateli někdo zabere email nebo profileId mezi validací a odesláním formuláře, případně jiné neočekávané chyby
    if(response?.email){
      setErrors((prev) => ({...prev, email: response.email}))
    }
    if(response?.profileId){
      setErrors((prev) => ({...prev, profileId: response.profileId}))
    }
    if(response?.created){
      navigate(location.state?.from?.pathname || '/')
      return;
    }
}
  return (
    <Container className='text-white p-0 bg-dark d-flex flex-row align-items-center mt-4 rounded shadow-lg'>
      <Container className='w-50 d-none d-md-flex flex-column text-center border-end border-secondary'>
        <h1 className='position-absolute' style={{width: "12vw"}}>Join us!</h1>
        <Image src={zerotwo}/>
      </Container>
      <Container className='d-flex flex-column bg-dark text-white rounded justify-content-center p-3 mt-2'>
        <h1> Register </h1>
        <Form className='w-75 ms-auto ms-md-0 me-auto me-md-0'>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <div className='w-100 d-flex'>
              <Form.Label>Email address</Form.Label>
            </div>
            <Form.Control type="email" placeholder="Enter email" isInvalid={errors.email}
              onChange={handleEmailChange}/>
            <Form.Control.Feedback type='invalid'>
              {errors.email}
            </Form.Control.Feedback>
            <Form.Text style={{color: "rgba(193, 193, 219, 1)"}}>
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" placeholder="Enter username" isInvalid={errors.username}
              onChange={(e) => setValue('username', e.target.value)}/>
            <Form.Control.Feedback type='invalid'>
              { errors.username }
            </Form.Control.Feedback>
            <Form.Text style={{color: "rgba(193, 193, 219, 1)"}}>Username must be between 3 and 20 characters!</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicProfileId">
            <Form.Label>ProfileId</Form.Label>
            <Form.Control type="text" placeholder="Enter profileId" isInvalid={errors.profileId}
              onChange={handleProfileIdChange}/>
            <Form.Control.Feedback type='invalid'>
              { errors.profileId }
            </Form.Control.Feedback>
            <Form.Text style={{color: "rgba(193, 193, 219, 1)"}}>This will be your unique identifier: <strong>@{values.profileId}</strong></Form.Text>
            <br></br>
            <Form.Text style={{color: "rgba(193, 193, 219, 1)"}}>ProfileId must be between 3 and 20 characters!</Form.Text>
            <br></br>
            <Form.Text className='text-warning'>This identifier will be permanent</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <PasswordInput
              placeholder="Password"
              isInvalid={errors.password}
              onChange={e => setValue('password', e.target.value)}
            />
            <Form.Text style={{color: "rgba(193, 193, 219, 1)"}}>Password must be atleast 8 characters, have one number and one big letter!</Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formRePassword">
            <Form.Label>Re-Password</Form.Label>
            <PasswordInput
              placeholder="Re-Password"
              isInvalid={errors.rePassword}
              onChange={e => setValue('rePassword', e.target.value)}
            />
          </Form.Group>
          <Stack direction='vertical'>
            <Button onClick={handleRegister} style={{backgroundColor: "rgba(98,98,115,1)", borderColor: "rgba(98,98,115,1)"}} type="submit">
              Register Me!
            </Button>
            <Container className='text-end'>
              <p className='m-0 align-self-middle'>Already user?</p>
              <Link className='text-decoration-none' to={"/auth/login"} state={{from: location.state?.from}}>Sign in!</Link>
            </Container>
          </Stack>
        </Form>
      </Container>
    </Container>
  )
}

export default Register