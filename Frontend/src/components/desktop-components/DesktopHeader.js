import {useContext, useEffect, useRef} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from '../providers/AuthProvider';
import  {Navbar, Container, Nav, Image, Form, NavDropdown, DropdownMenu, Dropdown, DropdownToggle, DropdownItem} from 'react-bootstrap'
import { Bell } from "lucide-react";
import Notification from "../header/Notification";
import { NotificationContext } from "../providers/NotificationProvider";
import usePost from "../hooks/usePost"
import API_URL from "../../config/api";


const DesktopHeader = ({show, setShow, filter, search, handleSearchChange}) => {

    const {notifications, setNotifications} = useContext(NotificationContext)
    const location = useLocation();
    const {isAuthenticated, logout, user} = useContext(AuthContext);
    const {handlePost: deleteNotification} = usePost(`${API_URL}/api/users/notification/delete`,
         (data, variables) => {
            //Jelikož notifikace nejsou ukládány do cache, ale pouze do stavu, tak je potřeba po smazání notifikace aktualizovat stav a odstranit smazanou notifikaci
            //Místo klasické invalidace cache
            const id = JSON.parse(variables.body).ids
            setNotifications(prev => prev.filter((n) => n._id !== id))
        }
         , [])
    const navigate = useNavigate();

    //Zde se vytváří reference notifikací, aby je šlo potom animovat
    const notificationRef = useRef(null)
    useEffect(() => {
        const ref = notificationRef.current;
        if(ref && notifications.length > 0){
            ref.classList.add('animate__animated', 'animate__heartBeat')
            ref.addEventListener('animationend', () => {
            ref.classList.remove('animate__animated', 'animate__heartBeat')
        })
        }
    }, [notifications])

    const handleUserClick = (user) => {
        navigate(`/profiles/${user}`);
        handleSearchChange({target: {value: ""}});
    }
     return (
    <>
    <Navbar expand="md" className="bg-body-tertiary sticky-top" style={{boxShadow: "0px 1em 200px rgba(0,0,0,0.5)"}}>
            <Container>
                <Navbar.Brand onClick={() => navigate("/")}>Home</Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link onClick={() => navigate("/layout")} >Layout</Nav.Link>
                    <Nav.Link onClick={() => navigate("/animes")}>Animes</Nav.Link>
                </Nav>
                <Container className="m-auto w-50" fluid>
                <Form.Control onFocus={() => setShow(true)} onBlur={() => {setShow(false); handleSearchChange({target: {value: ''}})}} placeholder="Search user by username..." value={search} type="search" onChange={handleSearchChange}>
                </Form.Control>
                    <Dropdown show={ filter.length !== 0 && show}>
                        <Dropdown.Menu>
                            {
                                filter && filter.slice(0,5).map((user, index) => {
                                    return <Dropdown.Item key={index} style={{cursor: "pointer"}} onMouseDown={() => handleUserClick(user.profileId)} >
                                        <div className="d-flex flex-row m-0 p-0 gap-2">
                                            <p className="m-0 p-0">{user.username}</p>
                                            <Image width={30} roundedCircle height={30} src={ user && (`${API_URL}/api/users/avatar/${user.profileId}`) } alt="pfp" />
                                            <p className="m-0 p-0 text-muted">{user.profileId}</p>
                                        </div>
                                    </Dropdown.Item >   
                                })
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </Container>
                                    
                <Nav>
                    {
                        isAuthenticated &&
                        (
                            <Dropdown className="d-flex align-items-center me-2">
                            <DropdownToggle ref={notificationRef} as={Bell} width={25} height={25} style={{cursor: "pointer"}} className="hvr-grow"></DropdownToggle>
                            <div className="user-select-none rounded-circle d-flex align-items-center justify-content-center text-white" style={{width: "15px", height: "15px", fontSize: "10pt" , backgroundColor: "rgba(255,0,0,1)", left: -5, bottom: 1, position: "absolute"}}>
                                    {notifications.length > 5 ? '5+' : notifications.length}
                            </div>
                                <DropdownMenu align="end" style={{maxWidth: 'min(360px, 95vw)'}}>
                                    {
                                        notifications.length === 0 ? (
                                            <DropdownItem>No Notifications</DropdownItem>
                                        ) :
                                        notifications.slice(0,5).map((notif) => {
                                            return <Notification key={notif._id} notif={notif} deleteNotification={() => deleteNotification.mutate({body: JSON.stringify({ids: notif._id})})}/>
                                        })
                                    }
                                    {
                                        notifications.length > 5 && <DropdownItem onClick={() => navigate("/notifications")}>See more..</DropdownItem>
                                    }
                                </DropdownMenu>
                            </Dropdown>
                        )
                    }
                    {
                        isAuthenticated ?
                        (
                            <div className="d-flex align-items-center">
                                <NavDropdown title={user.username}>
                                    <NavDropdown.Item onClick={() => navigate(`/profiles/${user.profileId}`)}>Profile</NavDropdown.Item>
                                    <NavDropdown.Item onClick={() => navigate(`/notifications`)}>Notifications</NavDropdown.Item>
                                    {user.type === 'moderator' && <NavDropdown.Item onClick={() => navigate(`/animes-validation`)}>Validations</NavDropdown.Item>}
                                    <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>                                   
                                </NavDropdown>
                                <Image key={user.profileId} src={`${API_URL}/api/users/avatar/${user.profileId}`} rounded width={40} height={40}/>
                            </div>
                        )
                        :
                        (
                            <>                                   
                                <Nav.Link 
                                    onClick={() => navigate("/auth/register", 
                                        location?.pathname === "/auth/login" 
                                        ? { state: { from: location?.state?.from } }
                                        : { state: { from: location } }
                                    )}
                                    >
                                    Register
                                </Nav.Link>
                                
                                <Nav.Link 
                                    onClick={() => navigate("/auth/login", 
                                        location?.pathname === "/auth/register" 
                                        ? { state: { from: location?.state?.from } }
                                        : { state: { from: location } }
                                    )}
                                    >
                                    Login
                                </Nav.Link>      
                            </>
                        )
                    }
                
                    
                </Nav>
                
            </Container>                      
        </Navbar>
    </>
  )
}

export default DesktopHeader