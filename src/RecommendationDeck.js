import {useState, useEffect} from 'react';
import axios from "axios";

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
        const response = await axios.put(playURL,data,{headers}).catch(error => console.log(error));
        console.log(response);

    }

    async function nextSong () {
        if (playerId === null) {
            await getPlayer()
        } 
        const headers = {
            Authorization: 'Bearer ' + props.accessToken
        };
        const nextRec = getNextRec()
        console.log(nextRec)
        const data = {
            uris: [recs[nextRec].uri]
        }
        setCurrRec(nextRec)
        const playURL = "https://api.spotify.com/v1/me/player/play"
        const response = await axios.put(playURL,data,{headers}).catch(error => console.log(error));
        console.log(response);
    }

    // Get the index of our next recommendation. (we have a finite number of recommendations)
    function getNextRec () {
        if (currRec + 1 === recs.length){
            return 0;
        }

        return currRec + 1

    }



    useEffect( () => {
        if(props.recs.length > 0){
            setRecs(props.recs)
        }
    })

    if (props.recs.length > 0){
        return(
            <div>
                {/* {props.recs.map((image, index) => (
                <img key={index} src={image.blob} alt={`Image ${index}`} />
                ))} */}
                <img key={0} src={props.recs[currRec].blob}/>
            {/* <img key={0} src={props.recImages[0]} /> */}

            <button onClick ={nextSong}>
                Next
            </button>

            <button onClick = {play}>
                Play
            </button>
          </div>
        )
    }

    return (
        <div>
            Images not Set
        </div>
    )

}

export default RecommendationDeck;