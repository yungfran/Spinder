import {useState, useEffect, useRef} from 'react';
import axios from "axios";
import "./RecommendationDeck.css"

function RecommendationDeck (props) {

    // Show an album cover with a song playing
    const [recs, setRecs] = useState(props.recs);

    const [currRec, setCurrRec] = useState(0)

    const [playerId, setPlayerId] = useState(null)

    const [startDragPos, setStartDragPos] = useState(0)

    const [currPercentage, setCurrPercentage] = useState(0)

    const [prevPercentage, setPrevPercentage] = useState(0)

    const trackRef = useRef(null)


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

    async function makePlaylist () {
        const currentDate = new Date();
        const headers = {
            Authorization: 'Bearer ' + props.accessToken
        };
        const playlistURI = "https://api.spotify.com/v1/users/"+ props.userId + "/playlists"
        const body = {
            name : "Playlist generated on " + currentDate.getMonth() + "/" + currentDate.getDate(),
            description: "Generated from these attributes: ",
            public: false
        }
        const createPlaylistResponse = await axios.post(playlistURI,body,{headers}).catch( (error) => console.log(error));
        console.log(createPlaylistResponse)
    }

    // Get the index of our next recommendation. (we have a finite number of recommendations)
    function getNextRec () {
        if (currRec + 1 === recs.length){
            return 0;
        }
        return currRec + 1
    }
    /* Start Track Movement */
    function startDrag (event) {
        const startXPos = event.clientX;
        setStartDragPos(startXPos)
    }


    function draggingTrack (event){
        if(startDragPos === "0" || startDragPos === 0) return;

        const track = trackRef.current;

        const posChange = startDragPos - event.clientX;
        const maxChange = window.innerWidth / 2;

        const percentage = (posChange / maxChange) * 100;
        const nextPercentageUnconstrained = parseFloat(prevPercentage) + percentage
        const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

        setCurrPercentage(nextPercentage)

        track.animate(
            [{ transform: `translate(${nextPercentage}%, -30%)` }],
            { duration: 2000, fill: 'forwards' }
          );

        const images = track.getElementsByClassName('track-image');
        for (const image of images) {
        image.animate(
            [{ objectPosition: `${100 + nextPercentage}% center` }],
            { duration: 1200, fill: 'forwards' }
        );
        }

    }

    function endDrag (event) {
        setStartDragPos(0)
        setPrevPercentage(currPercentage)
    }


    /* End Track Movement */

    // Play the next song whever currRec is updated
    useEffect ( () => {
        if(props.recs.length > 0){
            console.log("here")
            // play()
        }
    },[currRec])



    // Set recommendations intially
    useEffect( () => {
        if(props.recs.length > 0){
            console.log(props.recs)
            console.log("Inital Set")
            setRecs(props.recs)
        }
    })


    if (props.recs.length > 0) {
        return (
          <div className="rec-deck-wrapper" onMouseDown={startDrag} onMouseMove={draggingTrack} onMouseUp={endDrag}>

            <div className="tracks-wrapper" ref={trackRef}>
            {props.recs.map((rec, index) => (
  <div key={index} className={`track-image-wrapper ${index % 2 === 0 ? 'even' : 'odd'}`} draggable={false}>
    <img className="track-image" src={rec.blob} draggable={false} />
    <div className="track-info">
      <div className="track-name">
        {rec.name}
      </div>
      <div className="track-artist">
        {rec.artist}
      </div>
    </div>
  </div>
))}
            </div>
      
            {/* <button onClick={nextSong}>
              Next
            </button> */}
      
            <button onClick={makePlaylist}>
              Create Playlist
            </button>
          </div>
        );
      }

    return (
        <div>
            Loading images
        </div>
    )

}

export default RecommendationDeck;