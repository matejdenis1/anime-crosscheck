import { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';

//Custom input field pro heslo, s možností zobrazení/skrýtí hesla a zobrazení chybové hlášky
const PasswordInput = ({ value, onChange, placeholder, isInvalid}) => {
  const [show, setShow] = useState(false);

  return (
    <InputGroup>
      <Form.Control
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        isInvalid={isInvalid}
        placeholder={placeholder}
      />
      <Button
        title={show ? 'Show password' : 'Hide password'}
        variant='light'
        className='border border-muted rounded-end'
        onClick={() => setShow(prev => !prev)}
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
      <Form.Control.Feedback type='invalid'>
        {isInvalid}
      </Form.Control.Feedback>
    </InputGroup>
    
  );
};

export default PasswordInput;