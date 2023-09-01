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
        console.log("setting access appjs ", access)
        setAccessToken(access)
      }
    }

    if (refresh){
      setRefreshToken(refresh)
    }

  }, [accessToken,refreshToken]);


  if(!accessToken){
    return (
      <div className="App">
          <a href="http://localhost:8888/login">
            Login
          </a>
      </div>
    );
  } else {
    return (
      <LoggedIn access={accessToken} refresh = {refreshToken}/>
    )
  }

}

export default App;
