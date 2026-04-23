import {Row, Col, Stack, Placeholder} from 'react-bootstrap'
const AnimeDetailPlaceholder = () => {
  return (
    <Row className='mt-4' xs={1} sm={1} md={1} lg={2}>
      <Col lg={4}> 
        <Stack className='position-relative overflow-hidden'>
            <Placeholder as="div" animation="glow">
              <Placeholder 
                className='w-100 rounded' 
                style={{height: '450px'}}
              />
            </Placeholder>
        </Stack>     
      </Col>
      <Col className='d-flex flex-column mt-4'>
          <Placeholder as="div" animation="glow">
            <Placeholder xs={3} className='mb-3' />
            <Placeholder xs={12} className='mb-2' />
            <Placeholder xs={12} className='mb-2' />
            <Placeholder xs={8} className='mb-4' />
            
            <Stack direction='horizontal' className='flex-wrap' gap={2}>
              <Placeholder xs={2} className='rounded' style={{height: '40px'}} />
              <Placeholder xs={2} className='rounded' style={{height: '40px'}} />
              <Placeholder xs={2} className='rounded' style={{height: '40px'}} />
            </Stack>
            
            <Placeholder xs={6} className='rounded mt-2' style={{height: '50px'}} />
            <Placeholder xs={6} className='rounded mt-2' style={{height: '50px'}} />
            <Placeholder xs={6} className='rounded mt-2' style={{height: '50px'}} />
          </Placeholder>
      </Col>
    </Row>
  )
}

export default AnimeDetailPlaceholder