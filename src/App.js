import './App.css';
import {useEffect, useState} from 'react';
import GenerateRecommendations from './GenerateRecommendations';

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

  function redirectToLogin () {
    const href = "http://localhost:8888/login"
    window.location.href = href;
  }



  if(!accessToken){
    return (
      <div className="top-bar-wrapper">
            <div className="intro-text-wrapper"> 
              Generate recommendations based on different songs, artists, and musical tastes
            </div>
          
          <div className = "login-wrapper">
            <button className="login-button" onClick={redirectToLogin}> Login With Spotify </button>
            {/* <a href="http://localhost:8888/login">
              
            {/* <a href="https://7zjeo5uaxotzx2ydrntaznpfou0pftpe.lambda-url.us-east-2.on.aws/login"> 
              Login
            </a> */}
          </div>
      </div>
    );
  } else {
    return (
      <div>
        <GenerateRecommendations access={accessToken} refresh = {refreshToken}/>
      </div>
    )
  }

}

export default App;
