import { Button } from 'react-bootstrap'
import { useState } from 'react';
export const Genre = ({addGenre ,genre}) => {

  const[isActive, setIsActive] = useState(false);
  return (
     <div as={Button} className="rounded border-secondary m-1 p-2 hvr-grow" title={genre}
      style={{
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: isActive ? 'white' : 'black',
        backgroundColor: isActive ? 'rgb(31, 24, 24)' : 'rgb(255,255,255)'
      }} onClick={()=>{setIsActive(!isActive); addGenre();}}><p className='user-select-none m-0'>{genre}</p></div>
  )
}
