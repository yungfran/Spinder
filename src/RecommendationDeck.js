import {useState, useEffect} from 'react';
import axios from "axios";
import "./RecommendationDeck.css"

function RecommendationDeck (props) {

    // Show an album cover with a song playing
    // Pause, 
    const [recs, setRecs] = useState(props.recs);

    const [currRec, setCurrRec] = useState(0)

    const [playerId, setPlayerId] = useState(null)

    async function nextSong () {
        setCurrRec(currRec + 1)
    }

    async function getPlayer(){
        const playerURI = "https://api.spotify.com/v1/me/player/devices"
        const headers = {
            Authorization: 'Bearer ' + props.accessToken
        };

 

        const playerRepsonse = await axios.get(playerURI,{headers});
        const player = playerRepsonse.data.devices[0].id
        setPlayerId(player)
    }

    async function play () {
        if (playerId === null) {
            await getPlayer()
        } 
        const headers = {
            Authorization: 'Bearer ' + props.accessToken
        };

        const data = {
            uris: [recs[currRec].uri]
        }
        const playURL = "https://api.spotify.com/v1/me/player/play"

        // Play the song
       // const response = await axios.put(playURL,data,{headers}).catch(error => console.log(error));
        // console.log(response);
    }

    // Updates our currRec to +1 or 0
    async function nextSong () {
        const nextRec = getNextRec()
        setCurrRec(nextRec)
    }

    // Get the index of our next recommendation. (we have a finite number of recommendations)
    function getNextRec () {
        if (currRec + 1 === recs.length){
            return 0;
        }
        return currRec + 1
    }

    // Play the next song whever currRec is updated
    useEffect ( () => {
        if(props.recs.length > 0){
            play()
        }
    },[currRec])



    // Set recommendations intially
    useEffect( () => {
        if(props.recs.length > 0){
            console.log(props.recs)
            setRecs(props.recs)
        }
    })

    if (props.recs.length > 0){
        return(
            <div className="rec-deck-wrapper">
                <div className='track-image-wrapper'>
                <img className="track-image" key={0} src={props.recs[currRec].blob}/>
                </div>

            <button onClick ={nextSong}>
                Next
            </button>

          </div>
        )
    }

    return (
        <div>
            Loading images
        </div>
    )

}

export default RecommendationDeck;