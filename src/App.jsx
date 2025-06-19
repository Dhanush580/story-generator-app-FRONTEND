import './App.css'
import Login from './components/logincomponent/Login'
import Signup from './components/signupcomponent/Signup'
import Navbar from './components/navbarcomponent/Navbar'
import Welcome from './components/welcomecomponent/Welcome'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import ChatComponent from './components/chatcomponent/ChatComponent'
import UserProfile from './components/profilecomponent/UserProfile'
import OurTeam from './components/ourteamcomponent/OurTeam'
import 'bootstrap/dist/css/bootstrap.min.css';
function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Welcome/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/navbar' element={<Navbar/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/story-generation' element={<ChatComponent/>}/>
        <Route path='/profile' element={<UserProfile/>}/>
        <Route path='/our-team' element={<OurTeam/>}/>
      </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
