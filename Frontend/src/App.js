
import { Routes, Route} from 'react-router-dom';
import { lazy, Suspense, useContext } from 'react';
import Header from './components/header/Header';
import NotFound from './components/routes/NotFound';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './components/providers/AuthProvider';
import { Spinner, Container } from 'react-bootstrap';

const Register = lazy(() => import('./components/routes/Register'));
const Login = lazy(() => import('./components/routes/Login'));
const Home = lazy(() => import('./components/routes/Home'));
const Animes = lazy(() => import('./components/routes/Animes'));
const Layout = lazy(() => import('./components/routes/Layout'));
const Detail = lazy(() => import('./components/routes/Detail'));
const Profile = lazy(() => import('./components/routes/Profile'));
const Notifications = lazy(() => import('./components/routes/Notifications'));
const AnimesValidation = lazy(() => import('./components/routes/AnimesValidation'));

const PageLoader = () => (
  <Container className="d-flex justify-content-center align-items-center" style={{minHeight: '50vh'}}>
    <Spinner animation="border" />
  </Container>
);

function App() {
  const {user} = useContext(AuthContext)
  return (
    <>
      <Toaster />
      <Header/>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path='/animes-validation/' element={user?.type === "moderator" ? <AnimesValidation/> : <NotFound />} />
          <Route path='/profiles/:profileId' element={<Profile />} />
          <Route path='/anime/:id' element={<Detail />}/>
          <Route path='/animes' element={<Animes/>}/>
          <Route path='/layout' element={<Layout/>}/>
          <Route path='/' element={<Home/>}/>
          <Route path='/notifications' element={user !== undefined ? <Notifications/> : <NotFound />}/>
          <Route path='/auth/login' element={user ? <NotFound /> : <Login/>}/>
          <Route path='/auth/register' element={user ? <NotFound /> : <Register/>}/>
          <Route path='*' element={<NotFound/>}/>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;