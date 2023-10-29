import {useState, useEffect, useRef} from 'react';
import axios from "axios";
import "./RecommendationDeck.css"
import GenerateRecommendations from './GenerateRecommendations';

function RecommendationDeck (props) {

    // List of recomenndations 
    const [recs, setRecs] = useState(props.recs);

    const [playerId, setPlayerId] = useState(null)

    const [startDragPos, setStartDragPos] = useState(0)

    const [currPercentage, setCurrPercentage] = useState(0)

    const [prevPercentage, setPrevPercentage] = useState(0)

    const [startOverState, setStartOverState] = useState(false)

    const trackRef = useRef(null)

    /* Spotify Interactions*/
    async function getPlayer(){
        const playerURI = "https://api.spotify.com/v1/me/player/devices"
        const headers = {  Authorization: 'Bearer ' + props.accessToken  };


        const playerRepsonse = await axios.get(playerURI,{headers});
        const player = playerRepsonse.data.devices[0].id
        setPlayerId(player)
    }

    async function play (rec) {
        if (playerId === null) {  await getPlayer() } 
        const headers = {  Authorization: 'Bearer ' + props.accessToken };
        const data = {  uris: [rec.uri]  }
        const playURL = "https://api.spotify.com/v1/me/player/play"

        // Play the song
        const response = await axios.put(playURL,data,{headers}).catch(error => console.log(error));
    }

    /* Adds all songs in rec list to a new spotify playlist */
    async function makePlaylist () {
        const currentDate = new Date();
        const headers = {  Authorization: 'Bearer ' + props.accessToken   };
        const playlistURI = "https://api.spotify.com/v1/users/"+ props.userId + "/playlists"
        let addPlaylistURL = "https://api.spotify.com/v1/playlists/"
        const createBody = {
            name : "Playlist generated on " + currentDate.getMonth() + "/" + currentDate.getDate(),
            description: "",
            public: false
        }
        const createPlaylistResponse = await axios.post(playlistURI,createBody,{headers}).catch( (error) => console.log(error));
        const addBody = { range_start : 1, insert_before: 3, range_length:2 }
        addPlaylistURL += createPlaylistResponse.data.id + "/tracks?uris="
        recs.forEach( rec => {  addPlaylistURL += rec.uri + ","  })
        addPlaylistURL= addPlaylistURL.slice(0,-1) //Remove the last comma
        const addToPlaylistResponse = await axios.put(addPlaylistURL,addBody,{headers}).catch( (error) => console.log(error));
    }

    // Go back to the 
    function startOver () {
        console.log("here")
        setStartOverState(true)
    }

    /* End Spotify Interactions*/

    /* Start Track Movement */
    function startDrag (event) {
        const startXPos = event.clientX;
        setStartDragPos(startXPos)
    }

    useEffect( () => {
        console.log('startOverState has changed:', startOverState);
        setRecs([])

    },[startOverState])


    function draggingTrack (event){
        if(startDragPos === "0" || startDragPos === 0) return;

        const track = trackRef.current;

        const posChange = (startDragPos - event.clientX) * 0.3;
        const maxChange = window.innerWidth / 2;

        const percentage = (posChange / maxChange) * 100;
        const nextPercentageUnconstrained = parseFloat(prevPercentage) + percentage
       
        const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);
        setCurrPercentage(nextPercentage)

        track.animate(
            [{ transform: `translate(${nextPercentage}%, -30%)` }],
            { duration: 1200, fill: 'forwards' }
          );

        const images = track.getElementsByClassName('track-image');
        for (const image of images) {
        image.animate(
            [{ objectPosition: `${100 + nextPercentage}% center` }],
            { duration: 900, fill: 'forwards' }
        );
        }
    }

    function endDrag (event) {
        setStartDragPos(0)
        setPrevPercentage(currPercentage)
    }
    /* End Track Movement */

    // Set recommendations intially
    useEffect( () => {
        if(props.recs.length > 0){
            console.log(props.recs)
            console.log("Inital Set")
            setRecs(props.recs)
        }
    },[])

    if(startOverState === true){
        return ( <GenerateRecommendations access={ props.accessToken}/> )
    } else if (recs.length > 0){
        return (
            <div className="rec-deck-wrapper" onMouseDown={startDrag} onMouseMove={draggingTrack} onMouseUp={endDrag}>
                <div className="intro-text">
                  <div>  Drag the screen to see your recommendations </div>
                  <div> Open Spotify and click on a song to listen</div>
                  <button className="playlist-button" onClick={makePlaylist}>  Add Recommendations To Playlist  </button>
                  <button className="start-over-button" onClick={startOver}>   Start Over  </button>
                </div>
                <div className="tracks-wrapper" ref={trackRef}>
                    {props.recs.map((rec, index) => (
                        <div key={index} className='track-image-wrapper' draggable={false}>
                            <img className="track-image" onClick={() => play(rec)} src={rec.blob} draggable={false}/>
                            <div className="track-name">  {rec.name} </div>
                            <div className="track-artist"> {rec.artist} </div>
                        </div>))}
                </div>
            </div>
        );
      } else {
            return ( <div> Loading images </div> )
      }
}

export default RecommendationDeck;