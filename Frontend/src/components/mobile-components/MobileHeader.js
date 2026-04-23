import { useEffect, useContext, useRef} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from '../providers/AuthProvider';
import  {Navbar, Container, Nav, Image, Form, DropdownMenu, Dropdown, DropdownToggle, DropdownItem} from 'react-bootstrap'
import hamburger from '../../misc/hamburger.svg'
import searchIcon from '../../misc/search.svg'
import { NotificationContext } from "../providers/NotificationProvider";
import API_URL from "../../config/api";
const MobileHeader = ({show, setShow, handleSearchChange, search, filter}) => {
    const {notifications} = useContext(NotificationContext)
    const location = useLocation();
    const navigate = useNavigate()
    const {isAuthenticated, logout, user} = useContext(AuthContext);
    const searchRef = useRef(null);
    const handleUserClick = (user) => {
        navigate(`/profiles/${user}`);
    }
    useEffect(() => {
        if(searchRef.current){
            searchRef.current.focus();
        }
    }, [show])
  return (
    <>
    <Navbar expand="md" className="bg-body-tertiary sticky-top" style={{boxShadow: "0px 1em 200px rgba(0,0,0,0.5)"}}>
        <Container className="d-flex justify-content-between">
            <Dropdown show={show}>
                <DropdownToggle onClick={() => setShow(true) } as={Image} src={searchIcon} width={25} height={25} style={{cursor: 'pointer'}}></DropdownToggle>
                <DropdownMenu>
                    <Form.Control ref={searchRef} autoFocus onBlur={() => {setShow(false); handleSearchChange({target: {value: ''}})}} className="mx-3 my-2 w-auto" placeholder="John Doe" value={search} type="search" onChange={handleSearchChange} />
                    {
                        filter && filter.map((user, index) => {
                            return <Dropdown.Item className="mx-3 my-2 w-auto border-top bg-light" key={index} style={{cursor: "pointer"}} onMouseDown={() => handleUserClick(user.profileId)} >
                                <div className="d-flex flex-row gap-1">
                                    <p className="m-0 p-0">{user.username}</p>
                                    <Image width={30} roundedCircle height={30} src={ user && (`${API_URL}/api/users/avatar/${user.profileId}`) } alt="pfp" />
                                    <p className="m-0 p-0 text-muted">{user.profileId}</p>
                                </div>
                                </Dropdown.Item >   
                        })
                    }
                </DropdownMenu>
                
            </Dropdown>

            <Nav.Link onClick={() => navigate("/animes")}> Animes </Nav.Link>
            <Navbar.Brand onClick={() => navigate("/")}>Home</Navbar.Brand>
            <Nav.Link onClick={() => navigate("/layout")}>Layout</Nav.Link>





            <div className="position-relative">
            <Dropdown>
                <DropdownToggle as={Image} src={hamburger} width={25} height={25} style={{cursor: 'pointer'}}></DropdownToggle>
                {
                    isAuthenticated ? <> <DropdownMenu align='end'>
                        <DropdownItem  onClick={() => navigate("/profiles/"+user.profileId)}>Profile</DropdownItem>
                        <DropdownItem className="d-flex col gap-2"  onClick={() => navigate(`notifications`)}>
                            <p className="m-0">Notifications</p>
                        { notifications.length > 0 &&<div className="user-select-none rounded-circle d-flex align-items-center justify-content-center text-white" style={{width: "15px", height: "15px", fontSize: "10pt" , backgroundColor: "rgba(255,0,0,1)"}}></div>}
                        </DropdownItem>
                        <DropdownItem  onClick={() => logout()}>Logout</DropdownItem>
                    </DropdownMenu>
                    {notifications.length > 0 && <div className="user-select-none pe-none rounded-circle d-flex align-items-center justify-content-center text-white" style={{width: "15px", height: "15px", fontSize: "10pt" , backgroundColor: "rgba(255,0,0,1)", left: -5, bottom: -5, position: "absolute"}}></div>}
                    </>
                    : 
                    <DropdownMenu align='end'>
                        <DropdownItem  onClick={() => navigate("/auth/login", {state: {from: location}})}>Login</DropdownItem>
                        <DropdownItem  onClick={() => navigate("/auth/register", {state: {from: location}})}>Register</DropdownItem>
                    </DropdownMenu>
                }
            </Dropdown>
            
            </div>
        </Container>   
    </Navbar>
    </>
  )
}

export default MobileHeader