import axios from "axios";
import { useEffect, useState } from "react";
/* Props store access and refresh token*/
function LoggedIn( props ) {

    const [accessToken,setAccess] = useState(props.access)
    const [refreshToken,setRefresh] = useState(props.refresh)
    const [userSongs, setUserSongs] = useState([])
    
  
    

    /* Begin Access functions */
    async function checkToken () {
        const playlistURI =  "https://api.spotify.com/v1/me/playlists?limit=50"

        let playlistHeaders = "Authorization: Bearer " + accessToken
        const response = await axios.get(playlistURI, {playlistHeaders})
            .catch(error => { 
                if( error.response.status === 401){ 
                    // refresh()
                }
            })
    }

    async function refresh () {
        const queryParams = {
            refresh_token: refreshToken
          };
        const response = await axios.get("http://localhost:8888/refresh_token", {params:queryParams}).catch(error => console.error(error));
        if (response) {
            setAccess(response.data.access_token)
        }
    }

     /* End Access functions */

     /* Begin parsing user data */
     /* Store all playlistIds */
    async function getPlaylists() {
        const userPlaylistURI =  "https://api.spotify.com/v1/me/playlists?limit=50"
        const headers = {
            Authorization: 'Bearer ' + accessToken
        };
        console.log(accessToken)
        const response = await axios.get(userPlaylistURI, {headers})
        let nextUserPlaylistURI = response.data.next;
        console.log(response)
        let currPlaylistIDs = []
        response.data.items.forEach(playlist => currPlaylistIDs.push(playlist.tracks.href))
        console.log(currPlaylistIDs)
        
        if (nextUserPlaylistURI) {
            const nextPlaylistResponse = await axios.get(userPlaylistURI, {headers})
            nextUserPlaylistURI = nextPlaylistResponse.data.next
            nextPlaylistResponse.data.items.forEach( playlist => currPlaylistIDs.push(playlist.tracks.href))
        }
        
        return currPlaylistIDs;
    }

    async function parsePlaylists() {
        const playlists = await getPlaylists();
        const headers = {
            Authorization: 'Bearer ' + accessToken
        };
        let songs = await parsePlaylist(playlists[0])
       
    }

    async function parsePlaylist(playlistURI) {
        const headers = {
            Authorization: 'Bearer ' + accessToken
        };
        const response = await axios.get(playlistURI, {headers})
        console.log(response.data.items)
        // response.data.items.forEach( trackData => 
        //     {
        //         trackData.track
        //     }
        // )
        return;
    }

    /* End parsing user data*/





    
    useEffect( () => {
        refresh()
    },[])


    return(
        <div className="Yak">
            <button onClick={parsePlaylists}>
                LoggedIn        
            </button>
           
        </div>
    )


}

export default LoggedIn;