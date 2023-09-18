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

//   const [userId, setUserID] = useState([])

//   const [userSongs, setUserSongs] = useState(new Set()); /* Stores the songs the user has saved to savedSongs */
//   const [userArtists,setUserArtists] = useState(new Map()); /* All artists inside the users saved songs ArtistName: ArtistID*/

//   const [artistList, setArtistList] = useState([]) /* List of all artists saved from user's songs in array form*/
//   const [trackList, setTrackList] = useState([]) /* List of all artists saved from user's songs in array form*/
//   const [currentSonicTaste, setCurrentSonicTaste] = useState(null);

//   const [recImagesUrls, setRecImagesUrls] = useState([]);
//   const [topTrackFeatures, setTopTrackFeatures] = useState([]);

//   async function refresh () {
//     const queryParams = {
//         refresh_token: refreshToken
//       };
//     const response = await axios.get("http://localhost:8888/refresh_token", {params:queryParams}).catch(error => console.error(error));
//     if (response) {
//         console.log("setting token")
//         console.log(response.data.access_token)
//         setAccessToken(response.data.access_token)
//     }
// }




//   async function getUserProfile() {
//     const userURI = "https://api.spotify.com/v1/me"
//     const headers = {
//         Authorization: 'Bearer ' + accessToken
//     };
//     const response = await axios.get(userURI,{headers}).catch( error => console.log(error));
//     setUserID(response.data.display_name);
//   }


//   async function generateRecommendations() {
//     await analyzeSonicTastes();
//     // await getRecommendations();
//   }

//   async function analyzeSonicTastes () {
//     const calculatedTastes = localStorage.getItem("sonicTaste");
//     if (calculatedTastes === null || calculatedTastes === undefined){
//         console.log("calculating tastes")
//         await getTopSongsArtists("short_term")
//     } else {
//         console.log("doing nothing, already calculated")
//     }
// }


//  /* Gets top songs for the term, 
//      Term is long_term, medium_term, short_term 
//     With top songs / artists, use them to feed into rec system
//     */
//   async function getTopSongsArtists(term) {
//       if(topTrackFeatures.length === 20) {
//           return
//       }
//       const headers = {
//           Authorization: 'Bearer ' + accessToken
//       };
//       const topSongURI = "https://api.spotify.com/v1/me/top/tracks?time_range=" + term;
//       const response = await axios.get(topSongURI, { headers }).catch( error => console.log(error));;
//       const tracks = response.data.items;
//       console.log(tracks)

//       // Save the 5 randomtracks for recommendation seed
//       const topTrackIds = tracks.map(track => track.id).sort(() => Math.random() - 0.5).slice(0,5);
      
//       // Save the top 5 artists
//       const artists = tracks.map(track => track.artists[0].id).sort(() => Math.random() - 0.5).slice(0,5)
  
//       // Fetch features and populate topTrackFeatures
//       const tracksPromise = tracks.map(track => addSongToTopSongsFeatures(track.id))
//       await Promise.all(tracksPromise);

//       // Now that topTrackFeatures is populated, proceed with the next steps
//       localStorage.setItem("topTracks", JSON.stringify(topTrackIds))
//       localStorage.setItem("topArtists", JSON.stringify(artists))
//   }


//       /* Takes in a song ID and updates list containing song details*/
//       async function addSongToTopSongsFeatures(songId) {
//         const headers = {
//             Authorization: 'Bearer ' + accessToken
//         };
//         let featureURI = "https://api.spotify.com/v1/audio-features/" + songId;
//         const response = await axios.get(featureURI,{headers}).catch( error => console.log(error));
//         setTopTrackFeatures( prevTopTrackFeatures =>
//             {
//                 let newTopTrackFeatures = [...prevTopTrackFeatures, response.data]
//                 setTopTrackFeatures(newTopTrackFeatures)
//                 return [...prevTopTrackFeatures, response.data]
//             }
//         )
//     }

//         /* Checks local storage to see if */
//     async function storeArtistsAndTracks() {
//           const artistsFromStorage = localStorage.getItem('userArtists');
//           const tracksFromStorage = localStorage.getItem('userTracks')
//           if ( (artistsFromStorage !== null) && (tracksFromStorage !== null) ){
//                const artistsArray = JSON.parse(artistsFromStorage);
//                const tracksArray = JSON.parse(tracksFromStorage);
//                // Construct a new Map from the parsed array of entries
//                const artistsMap = new Map(artistsArray);
//                const trackMap = new Map(tracksArray);
//                setUserArtists(artistsMap);
//                setUserSongs(trackMap)
//            } else {
//                console.log("getting songs")
//                await getSavedSongs();
//                const userArtistMapStorage = JSON.stringify(Array.from(userArtists.entries()));
//                const userTracksMapStorage = JSON.stringify(Array.from(userSongs.entries()));
//                localStorage.setItem('userArtists', userArtistMapStorage);
//                localStorage.setItem('userTracks', userTracksMapStorage);
//            }
//       }

//         /* Retrieves all songs from saved songs and stores the artists along with their ID in userArtists*/
//     /* Todo Fix rate limit error*/
//     async function getSavedSongs() {
//         const headers = {
//             Authorization: 'Bearer ' + accessToken
//         };
//         const savedSongsURI = "https://api.spotify.com/v1/me/tracks?limit=50"
//         let response = await axios.get(savedSongsURI,{headers}).catch( error => console.log(error));
//         saveArtists(response.data.items)
//         saveTracks(response.data.items)
//         let numCalls = 1
//         let nextSongsURI = response.data.next;
//         while (nextSongsURI !== null && numCalls < 33) {
//             response = await axios.get(nextSongsURI,{headers}).catch( error => console.log(error));
//             saveArtists(response.data.items)
//             saveTracks(response.data.items)
//             nextSongsURI = response.data.next;
//         }
//     }

//     async function saveTracks(tracks){
//       setUserSongs(prevUserTracks => {
//           const newTracks = new Map(prevUserTracks);
//           tracks.forEach(trackData => {
//           if (trackData.track !== null && trackData.track !== undefined) {
//               const trackName = trackData.track.name
//               const trackId = trackData.track.id
//               if (trackData.track.artists !== null && trackData.track.artists !== undefined) {
//                   if(trackData.track.artists[0] !== null ){
//                       const artist = trackData.track.artists[0].name;
//                       if(!newTracks.has(trackName)){
//                           newTracks.set(trackName + " - " + artist,trackId)
//                       }
//                }
//               }
//           }
//       })
 
//       setUserSongs(newTracks)
//       return newTracks
//       });
//   }

//   /* Takes in a list tracks and adds each one to userArtists*/
//   async function saveArtists (tracks){
//       setUserArtists(prevUserArtist => {
//           const newArtists = new Map(prevUserArtist);
//           tracks.forEach(trackData => {
//           if (trackData.track !== null && trackData.track !== undefined) {
//               if (trackData.track.artists !== null && trackData.track.artists !== undefined) {
//                   if(trackData.track.artists[0] !== null ){
//                       const artistId = trackData.track.artists[0].id;
//                       const artist = trackData.track.artists[0].name;
//                       if(artistId !== null){
//                           if (!newArtists.has(artist)) {
//                               newArtists.set(artist, artistId);
//                           } 
//                       }
                      
//                }
//               }
//           }
//       }); 
//       setUserArtists(newArtists)
//       return newArtists
//    })
//   }


  if(!accessToken){
    return (
      <div className="top-bar-wrapper">
            <div className="intro-text-wrapper"> 
              Generate recommendations based on different songs, artists, and musical tastes
            </div>
          
          <div className = "login-wrapper">
            <a href="http://localhost:8888/login">
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
