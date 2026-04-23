import React from 'react'
import { Placeholder, Toast, ToastBody, ToastHeader } from 'react-bootstrap'

const CommentPlaceholder = () => {
  return (
        <Toast>
            <Placeholder as={ToastHeader} closeButton={false} animation="glow">
                <Placeholder as="span" className="me-auto w-25"/>
                <Placeholder as="small" className="ms-auto w-25"/>
            </Placeholder>
            <Placeholder as={'div'} animation='wave'>
                <Placeholder as={ToastBody} className="w-50 rounded m-2"></Placeholder>
            </Placeholder>
            <Placeholder as={'div'} animation='wave'>
                <Placeholder as={'div'} className="w-100">
                    
                </Placeholder>
            </Placeholder>
            <Placeholder as={'div'} animation='wave'>
                <Placeholder className='border-top border-grey bg-secondary d-flex justify-content-center'> {Array.from({length: 5}).map((_, i)=> {
                return <svg key={i} width="30" height="30" viewBox="0 0 24 24" fill="grey" stroke='grey' >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
            })} </Placeholder>
            </Placeholder>
        </Toast>
  )
}

export default CommentPlaceholder