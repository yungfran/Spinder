import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {useEffect, useState} from 'react';
import LoggedIn from './LoggedIn';

function App() {

  /* Stores whether or not we are logged in*/ 
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')

useEffect( () => {
  const searchParams = new URLSearchParams(window.location.search);
  const access = searchParams.get('access_token');
  const refresh = searchParams.get('refresh_token');
  
  if(access){
    if(accessToken === ''){
      setAccessToken(access)
    }
  }

  if (refresh){
    setRefreshToken(refresh)
  }

}, [accessToken,refreshToken]);



  if(!accessToken){
    return (
      <div className="top-bar-wrapper">
            <div className="intro-text-wrapper"> 
              Generate recommendations based on different songs, artists, and musical tastes
            </div>
          
          <div className = "login-wrapper">
            <a href="http://localhost:8888/login">
            {/* <a href="https://7zjeo5uaxotzx2ydrntaznpfou0pftpe.lambda-url.us-east-2.on.aws/login"> */}
              Login
            </a>
          </div>
      </div>
    );
  } else {
    return (
      <div>
        <LoggedIn access={accessToken} refresh = {refreshToken}/>
      </div>
    )
  }

}

export default App;
