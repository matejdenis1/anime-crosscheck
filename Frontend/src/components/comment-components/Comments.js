import { useRef, useCallback, useState, useEffect } from 'react'
import { Stack } from 'react-bootstrap';
import { useWindowWidth } from '../hooks/useWindowWidth'
import CommentProfile from './CommentProfile';
import CommentAnime from './CommentAnime'
import { ScrollHint } from '../misc/ScrollHint';
import { RecentRatings } from '../homepage-components/RecentRatings';


//Tato komponenta použivá observer na zjištění, jestli je uživatel na mobilu dole a pokud ano, zobrazí mu hint, že může scrollovat pro zobrazení dalších komentářů
//Dále se zde zobrazuje buď CommentProfile, CommentAnime nebo RecentRatings, podle toho, odkud je komponenta volána
const Comments = ({source, ...props}) => {
    
    const windowWidth = useWindowWidth();
    const observerRef = useRef(null)
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [comments, setComments] = useState(props.comments);

    useEffect(() => {
        setComments(props.comments)
    }, [props.comments])

    useEffect(() => {
        return () => {
            if(observerRef.current){
                observerRef.current.disconnect()
            }
        }
    }, [])

    const handleDeleteComment = (id) => {
        if(source !== 'profile') return;
        setComments(prev => prev.filter(comment => comment._id !== id))
    }

    //Styly pro zobrazení komentářů na mobilu
    const flexStyleComments = {
        justifyContent: 'start',
        overflowX: 'auto',
        flexWrap: 'nowrap',
    }
    //Vytváření observeru, který sleduje spodní část obrazovky
    const bottomRef = useCallback((node) => {
        if(observerRef.current){
            observerRef.current.disconnect()
        }
        if(node){
            observerRef.current = new IntersectionObserver(([entry]) => setIsAtBottom(entry.isIntersecting), {threshold: 1.0})
            observerRef.current.observe(node)
        }
    }, [])
  return (
    <>
        <Stack direction="horizontal" className="pt-3 mb-3" style={{...(windowWidth <= 800 ? flexStyleComments : {flexWrap: 'wrap', justifyContent: 'center'})}} gap={2}>
            {
                source === 'anime' && comments.map((comment) => (
                    <CommentAnime key={comment._id} comment={comment}/>
                ))
            }
            {
                source === 'profile' && comments.map((comment) => (
                    <CommentProfile key={comment._id} comment={comment} unMount={() => handleDeleteComment(comment._id)}/>
                ))
            }
            {
                source === 'homepage' && comments.map((comment) => (
                    <RecentRatings key={comment._id} rating={comment}/>
                ))
            }
            {windowWidth <= 800 && isAtBottom && comments.length > 2 && <ScrollHint />}
        </Stack>
        <div ref={bottomRef} style={{height: '1px'}}></div>
    </> 
  )
}

export default Comments