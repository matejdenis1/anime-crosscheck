import {useContext, useEffect, useState} from 'react'
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import { Container, Image, Button, Row, Stack, Col, DropdownButton, DropdownItem} from 'react-bootstrap';
import AnimeRating from '../animes-components/AnimeRating';
import Comments from '../comment-components/Comments';
import UsernameModal from '../modals/profile/UsernameModal'
import PasswordModal from '../modals/profile/PasswordModal';
import PfpModal from '../modals/profile/PfpModal'
import { Check } from 'lucide-react';
import { useDebouncedCallback} from '@tanstack/react-pacer';
import useFetch from '../hooks/useFetch';
import usePost from '../hooks/usePost';
import useAnimes from '../hooks/useAnimes';
import { useWindowWidth } from '../hooks/useWindowWidth';
import DeleteUserModal from '../modals/profile/deleteUserModal'
import { useQueryClient } from '@tanstack/react-query';
import SeeMoreModal from '../modals/SeeMoreModal';
import API_URL from "../../config/api";

const Profile = () => {
  const {profileId} = useParams();
  const queryClient = useQueryClient();

  const {data: userProfileData} = useFetch(`${API_URL}/api/users/username/`+profileId,
    ['userProfile', profileId],
    profileId !== undefined)

  const {handlePost: followUser} = usePost(`${API_URL}/api/users/follow/`, 
    () => {
      queryClient.invalidateQueries({queryKey: ['user']}); 
      queryClient.invalidateQueries({queryKey: ['userProfile',profileId]})}, 
      []);

  const {handlePost: changeView} = usePost(`${API_URL}/api/users/private/`, () => {
    queryClient.setQueryData(['user'], (oldUser) => oldUser ? { ...oldUser, private: !oldUser.private } : oldUser);
    queryClient.setQueryData(['userProfile', profileId], (oldProfile) => oldProfile ? { ...oldProfile, private: !oldProfile.private } : oldProfile);
    setProfileData(prev => prev ? { ...prev, private: !prev.private } : prev);
  }, [])

  const {handlePost: editUserProfile} = usePost(`${API_URL}/api/users/edit/user`, (data) => {
    setPfpModalShow(false)
    setUsernameModalShow(false)
    setPasswordModalShow(false)
    //Změna username se projeví na více místech (recent ratings, komentáře na detailu anime, follower/follow listy jiných profilů),
    //takže je potřeba invalidovat širší cache než jen aktuální profil.
    if(data?.update === 'username'){
      queryClient.invalidateQueries({queryKey: ['userProfile']})
      queryClient.invalidateQueries({queryKey: ['homePageData']})
      queryClient.invalidateQueries({queryKey: ['anime']})
    } else {
      queryClient.invalidateQueries({queryKey: ['userProfile', profileId]})
    }
  }, ['user'])

  const [seeMoreModalShow, setSeeMoreModalShow] = useState(false);
  const [seeMoreTitle, setSeeMoreTitle] = useState('');
  const [seeMoreContent, setSeeMoreContent] = useState([])
  const {user, isAuthenticated, deleteUser} = useContext(AuthContext)
  const [profileData, setProfileData] = useState();
  const [canEdit, setCanEdit] = useState(false);
  const [profilePhoto, setPfp] = useState()
  const [loading, setLoading] = useState(true);
  const [activeFollowBtn, setAFB] = useState();
  const [usernameModalShow, setUsernameModalShow] = useState(false);
  const [passwordModalShow, setPasswordModalShow] = useState(false);
  const [pfpModalShow, setPfpModalShow] = useState(false);
  const [deleteUserModal, setDeleteUserModal] = useState(false);
  const [alsoFollowing, setAlsoFollowing] = useState([]);
  const {animes: animesOfInterest} = useAnimes();
  const windowWidth = useWindowWidth();

  //Inicializace dat profilu a oprávnění k úpravám v případě, že se jedná o vlastníka profilu
  useEffect(() => {
    if(!userProfileData) return;
    setCanEdit(false)
    if(user?.profileId === profileId){
      setCanEdit(true)
      const {animes, ...userData} = user;
      setProfileData({...userProfileData, ...userData})
    }
    else{
      if(isAuthenticated){
        const commonFollowers = user.follows.filter(follow => userProfileData.followers.some((follower) => follower._id === follow._id));
        setAlsoFollowing(commonFollowers)
      }
      setProfileData(userProfileData)
    }
    setLoading(false);
  }, [userProfileData, profileId, user, isAuthenticated])


  //
  const handleViewToggle = useDebouncedCallback((change) => 
    { change !== profileData.private && changeView.mutate({})}, 
  {wait: 1000})
  const handleFollow = useDebouncedCallback((profileId) => {
    followUser.mutate({params: profileId})
  }, {wait: 1000})
  useEffect(() => {
    if(profileData && user){
      const alreadyFollows = user.follows.some((follow) => follow._id === profileData._id)
      setAFB(alreadyFollows)
    }
  }, [profileData, user])

  //Rozděluje mezi dvě skupiny following a followers a podle toho zobrazuje odpovídající modal
  const handleSeeMoreShow = (e) => {
    const targetId = e.target.id;
    setSeeMoreTitle(targetId);
    setSeeMoreContent(profileData[targetId])
    setSeeMoreModalShow(true);
  }

  const handleSeeMoreHide = () => {
    setSeeMoreModalShow(false);
  }
  const handleUsernameHide = () => {
    setUsernameModalShow(false); 
  }
  const handlePasswordHide = () => {
    setPasswordModalShow(false)
  }
  const handleUserEdit = (formData) => {
    editUserProfile.mutate({body: formData})
  }
  const handleChangePfp = (prop) => {
    setPfp(prop)
  }
  return (
    <>
    {
      !loading && 
      <>
      {
        canEdit && (<>
            <UsernameModal show={usernameModalShow} close={handleUsernameHide} edit={handleUserEdit}/>
            <PasswordModal show={passwordModalShow} close={handlePasswordHide} edit={handleUserEdit}/>
            <PfpModal show={pfpModalShow} close={() => setPfpModalShow(false)} edit={handleUserEdit} setPfp={handleChangePfp}/>
            <DeleteUserModal show={deleteUserModal} close={() => setDeleteUserModal(false)} deleteUser={deleteUser}/> 
          </>)
      }
      {
        <SeeMoreModal show={seeMoreModalShow} handleClose={handleSeeMoreHide} title={seeMoreTitle === "follows" ? "Following" : "Followers"} content={seeMoreContent} handleFollow={handleFollow}/>
      }
      <Container className='rounded border border-dark shadow-lg mt-3'>
        <Row sm={1} md={2}>
          <Col sm={12} md={6} className='d-flex flex-row'>
            <Image className='m-3 border border-dark shadow-lg' style={{borderRadius: '20px'}} src={ profilePhoto ? profilePhoto : profileId && `${API_URL}/api/users/avatar/${profileId}`} width={200} height={200}/>
            <div className='d-flex row mt-3'>
              <div className='d-flex flex-column align-self-start'>
                <h2 className=' m-0'>{profileData.username}</h2>
                <p className='text-muted m-0'>{profileData.profileId}</p>
              </div>
              <div className='align-self-end mb-3'>
                <div className=' d-flex flex-row gap-3'>
                      <span onClick={handleSeeMoreShow} id="follows" style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: '500'}}>
                        Following: {profileData.follows?.length || 0}
                      </span>
                      <span onClick={handleSeeMoreShow} id="followers" style={{textDecoration: 'underline', cursor: 'pointer', fontWeight: '500'}}>
                        Followers: {profileData.followers?.length || 0}
                      </span>
                  </div>
                  {
                   isAuthenticated && !canEdit && alsoFollowing.length !== 0 && (
                    <>
                      <span style={{ cursor: 'default', fontWeight: '500'}}>
                          Also followed by:
                        </span>
                          {
                            alsoFollowing.map((follower, index) => (
                              <span key={follower._id} className='ms-1'>
                                <Link className='text-dark' to={'/profiles/'+follower.profileId} style={{textDecoration: 'underline'}}>{follower.username}</Link>
                                {index < alsoFollowing.length - 1 && ', '}
                              </span>
                            ))
                          }
                      </>
                    )
                  }
              </div>
            </div>
            
          </Col>
          <Col md={6} className='align-self-end mb-3'>
              <Stack direction='vertical' gap={1} className={windowWidth > 800 ? 'ms-auto w-50' : 'w-100'}>
              {
                canEdit && 
                <>
                  <Button className='btn-primary' onClick={() => setUsernameModalShow(true)}>Change Username</Button>
                  <Button className='btn-primary' onClick={() => setPasswordModalShow(true)}>Change Password</Button>
                  <Button className='btn-primary' onClick={() => setPfpModalShow(true)}>Change profile photo</Button>
                  <Button className='btn-danger' onClick={() => setDeleteUserModal(true)}>Delete profile</Button>
                </>
              }
              </Stack>
          </Col>
        </Row>
      </Container>
      
      <Container className='mt-3'>
        {
          !canEdit && isAuthenticated && (<Button onClick={() => handleFollow(profileId)} variant='secondary'>{activeFollowBtn ? 'Unfollow' : 'Follow'}</Button>)
        }
        {
          canEdit && <DropdownButton title='Toggle anime view' drop='end' variant='secondary'>
          <DropdownItem onClick={() => handleViewToggle(false)}>Public {!user?.private && <Check />}</DropdownItem>
          <DropdownItem onClick={() => handleViewToggle(true)}>Private {user?.private && <Check />}</DropdownItem>
        </DropdownButton>
        }
      </Container>
        <Container className='w-100 pt-2'>
          {
            profileData.private && user?.profileId !== profileId ? <div className='mt-3 rounded d-flex justify-content-center' style={{height: '250px', backgroundColor: 'rgb(54, 71, 83)',boxShadow: '0 0 20px -5px'}}>
              <strong className='align-self-center text-light' style={{fontSize: '3rem'}}>Favorites are private!</strong>
            </div>
            :
            profileData.animes?.length > 0 ? <Stack direction='horizontal' className='overflow-x-auto pt-3' style={{justifyContent: 'start'}} >
              {
                profileData.animes.map((anime) => {
                  const animeRating = profileData.comments?.find(rating => rating.animeId === anime.id)
                  return <AnimeRating key={anime.id} userRating={animeRating} anime={anime} animesOfInterest={animesOfInterest}/>
                }) 
              }
            </Stack> : <div className='mt-3 rounded d-flex justify-content-center' style={{height: '250px', backgroundColor: 'rgb(54, 71, 83)',boxShadow: '0 0 20px -5px'}}>
                  <strong className='align-self-center text-light' style={{fontSize: '3em'}}>There are no favorites at the moment!</strong>
                </div>
            
          }
        {
          (!profileData.comments || profileData.comments.length === 0) && <div className="text-white d-flex shadow-lg justify-content-center mt-4 rounded" style={{height: '100px', backgroundColor: 'rgb(54, 71, 83)'}}>
                  <p className="align-self-center m-0" style={{fontSize: '2rem', fontWeight: '500'}}>There are no recent ratings!</p>
              </div>
        }
        <Comments source="profile" comments={profileData.comments ?? []}/>
      </Container>
      </>
    }
    </>
    
  )
}

export default Profile