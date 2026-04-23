import { useState } from 'react'
import { Container, Button, Spinner, Col, Row} from 'react-bootstrap'
import AnimeToValidate from '../validation-components/AnimeToValidate'
import usePost from '../hooks/usePost'
import useFetch from "../hooks/useFetch";
import { useQueryClient } from '@tanstack/react-query';
import API_URL from "../../config/api";
const AnimesValidation = () => {

    const queryClient = useQueryClient();
    const [selectedAnime, setSelectedAnimes] = useState();
    const onDatabaseRefreshed = () => {
        queryClient.invalidateQueries({queryKey: ['animes']});
        queryClient.invalidateQueries({queryKey: ['homePageData']});
    }
    const {handlePost: verifyAnime} = usePost(`${API_URL}/api/anime/verify/`, () => setSelectedAnimes(undefined), ['animes-validation'])
    const {handlePost: refreshDatabase} = usePost(`${API_URL}/api/database/update`, onDatabaseRefreshed, ['animes-validation'])
    const {data: animes, isLoading} = useFetch(`${API_URL}/api/animes/validation`, ['animes-validation'], true)
    const handleVerifyAnime = (formData) => {
        const animeId = selectedAnime.id;
        verifyAnime.mutate({body: formData}, {
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ['anime', animeId]});
                queryClient.invalidateQueries({queryKey: ['animes']});
                queryClient.invalidateQueries({queryKey: ['homePageData']});
            }
        });
    }
    if(isLoading) return <>Loading...</>
    return (
        <>
        
        <Container className='w-100 pt-3'>
            <Row md={2}>
                <Col md={4}>
                <Container className='d-flex flex-column gap-1 rounded' style={{border: '2px solid', boxShadow: '0 0 20px -10px', backgroundColor: '#fff'}}>
                    <strong>Anime List:</strong>
                    {
                        refreshDatabase.isPending ? <Spinner className='ms-auto me-auto' style={{width: '200px', height: '200px'}} animation='border'/> : animes.map(anime => {
                        return <div  key={anime.id} 
                        onClick={() => setSelectedAnimes(anime)} 
                        className='border border-dark text-center rounded text-decoration-none hvr-fade p-1' 
                        style={{cursor: 'pointer'}}>
                            {anime.title}
                            </div>
                        })
                    }
                    <div className='ms-auto me-auto p-2'>
                        <Button onClick={() => refreshDatabase.mutate({})} disabled={refreshDatabase.isPending}>Refresh Database</Button>
                    </div>
                </Container>
                </Col>
                <Col md={8}>  
                    {
                        selectedAnime && <AnimeToValidate key={selectedAnime.id} anime={selectedAnime} verifyAnime={handleVerifyAnime}/>
                    }
                </Col>
            </Row>
        </Container>
        
        </>
    )
}

export default AnimesValidation