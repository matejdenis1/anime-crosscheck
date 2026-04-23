import { Modal, Button } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { Link } from 'react-router-dom';
import usePost from '../hooks/usePost';
import { useDebouncedCallback } from '@tanstack/react-pacer';
import { useQueryClient } from '@tanstack/react-query';
import API_URL from "../../config/api";
function SeeMoreModal({ show, handleClose, title, content}) {

    const {user, isAuthenticated} = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [updatedContent, setUpdatedContent] = useState([]);
    //Vytváří se POST operace pro follow / unfollow uživatele v prostředí modalu a
    //invaliduje se cache na stráně uživatele a profilu, aby se změna projevila okamžitě. Pro zamezení spamování follow / unfollow tlačítka se používá debounce s čekáním 500ms. V rámci modalu se také kontroluje, zda uživatel již sleduje daný profil, a podle toho se řadí obsah a mění text a styl tlačítka.
    const {handlePost: followUser} = usePost(`${API_URL}/api/users/follow/`, (_, variables) => {
        queryClient.invalidateQueries({queryKey: ['user']});
        const targetProfileId = variables?.params;
        if(targetProfileId) queryClient.invalidateQueries({queryKey: ['userProfile', targetProfileId]});
    }, []);
    useEffect(() => {
        if (content) {
            const enrichedContent = content.map(c => ({
                ...c,
                alreadyFollowed: user?.follows?.some(follow => follow.profileId === c.profileId) || false
            }));
            const sorted = enrichedContent.sort((a, b) => b.alreadyFollowed - a.alreadyFollowed);
            setUpdatedContent(sorted);
        }
    }, [content, user?.follows]);

    const handleFollowUser = useDebouncedCallback((profileId) => {
        setUpdatedContent(prevContent => prevContent.map(c => 
            c.profileId === profileId ? { ...c, alreadyFollowed: !c.alreadyFollowed } : c
        ));
        followUser.mutate({params: profileId});
    }, {wait: 500});
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    updatedContent.map(c => (
                        <div key={c.profileId}>
                            <div className='rounded' style={{ display: 'flex', gap: '1rem', padding: '0.5rem', backgroundColor: '#e9ecef', borderBottom: '2px solid white', marginBottom: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <img src={`${API_URL}/api/users/avatar/${c.profileId}`} alt={c.username} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                    <Link onClick={handleClose} className='text-decoration-none' to={'/profiles/'+c.profileId} style={{ margin: 0 }}>{c.username}</Link>
                                    <p style={{ margin: 0 }} className="text-muted">{c.profileId}</p>
                                </div>
                                {isAuthenticated && (
                                    c.profileId === user?.profileId ? (
                                        <span className="text-muted me-2" style={{ fontWeight: '500' }}>You</span>
                                    ) : (
                                        <Button variant={c.alreadyFollowed ? "secondary" : "primary"} className="rounded-pill" onClick={() => handleFollowUser(c.profileId)}>
                                            {c.alreadyFollowed ? "Unfollow" : "Follow"}
                                        </Button>
                                    )
                                )}
                            </div>
                            <hr style={{ margin: '0.5rem 0', borderColor: '#333', borderWidth: '3px' }} />
                        </div>
                    ))
                }
            </Modal.Body>
        </Modal>
    );
}

export default SeeMoreModal;
