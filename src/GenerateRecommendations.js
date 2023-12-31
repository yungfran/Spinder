import axios from "axios";
import { useEffect, useState } from "react";
import * as statistics from 'simple-statistics';
import RecommendationDeck from "./RecommendationDeck";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import "./GenerateRecommendations.css"
import Select from "react-select";

/* Props store access and refresh token*/
function GenerateRecommendations( props ) {

    /* Access Tokens*/
    const [accessToken,setAccess] = useState(props.access)
    const [refreshToken,setRefresh] = useState(props.refresh)

    const [userId, setUserID] = useState([])

    const [userSongs, setUserSongs] = useState(new Set()); /* Stores the songs the user has saved to savedSongs */
    const [userArtists,setUserArtists] = useState(new Map()); /* All artists inside the users saved songs ArtistName: ArtistID*/

    const [artistList, setArtistList] = useState([]) /* List of all artists saved from user's songs in array form*/
    const [trackList, setTrackList] = useState([]) /* List of all artists saved from user's songs in array form*/
    const [currentSonicTaste, setCurrentSonicTaste] = useState(null);


    const [recImagesUrls, setRecImagesUrls] = useState([]);
    const [topTrackFeatures, setTopTrackFeatures] = useState([]);

    const [genreCounts, setGenreCounts] = useState(new Map()); /* Counts the genres the user listens to */
    const [recommendations, setRecommendations] = useState([]);
    const [recImages, setRecImages] = useState([]);

    const NUM_SONGS_RETRIEVED_FROM_SAVED = 20
    const DEFAULT_RANGE = 0.15


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
            console.log("setting token")
            console.log(response.data.access_token)
            setAccess(response.data.access_token)
        }
    }

    /* Checks local storage to see if */
    async function storeArtistsAndTracks() {
       const artistsFromStorage = localStorage.getItem('userArtists');
       const tracksFromStorage = localStorage.getItem('userTracks')
       if ( (artistsFromStorage !== null) && (tracksFromStorage !== null) ){
            const artistsArray = JSON.parse(artistsFromStorage);
            const tracksArray = JSON.parse(tracksFromStorage);
            // Construct a new Map from the parsed array of entries
            const artistsMap = new Map(artistsArray);
            const trackMap = new Map(tracksArray);
            setUserArtists(artistsMap);
            setUserSongs(trackMap)
        } else {
            console.log("getting songs")
            await getSavedSongs();
            const userArtistMapStorage = JSON.stringify(Array.from(userArtists.entries()));
            const userTracksMapStorage = JSON.stringify(Array.from(userSongs.entries()));
            localStorage.setItem('userArtists', userArtistMapStorage);
            localStorage.setItem('userTracks', userTracksMapStorage);
        }
    }

    async function saveTracks(tracks){
        setUserSongs(prevUserTracks => {
            const newTracks = new Map(prevUserTracks);
            tracks.forEach(trackData => {
            if (trackData.track !== null && trackData.track !== undefined) {
                const trackName = trackData.track.name
                const trackId = trackData.track.id
                if (trackData.track.artists !== null && trackData.track.artists !== undefined) {
                    if(trackData.track.artists[0] !== null ){
                        const artist = trackData.track.artists[0].name;
                        if(!newTracks.has(trackName)){
                            newTracks.set(trackName + " - " + artist,trackId)
                        }
                 }
                }
            }
        })
   
        setUserSongs(newTracks)
        return newTracks
        });
    }

    /* Takes in a list tracks and adds each one to userArtists*/
    async function saveArtists (tracks){
        setUserArtists(prevUserArtist => {
            const newArtists = new Map(prevUserArtist);
            tracks.forEach(trackData => {
            if (trackData.track !== null && trackData.track !== undefined) {
                if (trackData.track.artists !== null && trackData.track.artists !== undefined) {
                    if(trackData.track.artists[0] !== null ){
                        const artistId = trackData.track.artists[0].id;
                        const artist = trackData.track.artists[0].name;
                        if(artistId !== null){
                            if (!newArtists.has(artist)) {
                                newArtists.set(artist, artistId);
                            } 
                        }
                        
                 }
                }
            }
        }); 
        setUserArtists(newArtists)
        return newArtists
     })
    }

    /* Retrieves all songs from saved songs and stores the artists along with their ID in userArtists*/
    /* Todo Fix rate limit error*/
    async function getSavedSongs() {
        const headers = {  Authorization: 'Bearer ' + accessToken };
        const savedSongsURI = "https://api.spotify.com/v1/me/tracks?limit=50"
        let response = await axios.get(savedSongsURI,{headers})
        saveArtists(response.data.items)
        saveTracks(response.data.items)
        let numCalls = 1
        let nextSongsURI = response.data.next;
        while (nextSongsURI !== null && numCalls < 33) {
            response = await axios.get(nextSongsURI,{headers}).catch( error => console.log(error));
            saveArtists(response.data.items)
            saveTracks(response.data.items)
            nextSongsURI = response.data.next;
        }
    }

    async function generateRecommendations() {
       await analyzeSonicTastes();
      // await getRecommendations();
    }

    async function analyzeSonicTastes () {
        const calculatedTastes = localStorage.getItem("sonicTaste");
        if (calculatedTastes === null || calculatedTastes === undefined){
            console.log("calculating tastes")
            await getTopSongsArtists("short_term")
        } else {
            console.log("doing nothing, already calculated")
            setCurrentSonicTaste(JSON.parse(calculatedTastes))
        }
    }

    /* Gets top songs for the term, 
     Term is long_term, medium_term, short_term 
    With top songs / artists, use them to feed into rec system
    */
    async function getTopSongsArtists(term) {
        if(topTrackFeatures.length === 20) { return  }
        const headers = {   Authorization: 'Bearer ' + accessToken  };
        const topSongURI = "https://api.spotify.com/v1/me/top/tracks?time_range=" + term;
        const response = await axios.get(topSongURI, { headers });
        const tracks = response.data.items;

        // Save the 5 randomtracks for recommendation seed
        const topTrackIds = tracks.map(track => track.id).sort(() => Math.random() - 0.5).slice(0,5);
        
        // Save the top 5 artists
        const artists = tracks.map(track => track.artists[0].id).sort(() => Math.random() - 0.5).slice(0,5)
    
        // Fetch features and populate topTrackFeatures
        const tracksPromise = tracks.map(track => addSongToTopSongsFeatures(track.id))
        await Promise.all(tracksPromise);

        // Now that topTrackFeatures is populated, proceed with the next steps
        localStorage.setItem("topTracks", JSON.stringify(topTrackIds))
        localStorage.setItem("topArtists", JSON.stringify(artists))
    }
    
    /* Takes in a song ID and updates list containing song details*/
    async function addSongToTopSongsFeatures(songId) {
        const headers = {
            Authorization: 'Bearer ' + accessToken
        };
        let featureURI = "https://api.spotify.com/v1/audio-features/" + songId;
        const response = await axios.get(featureURI,{headers})
        setTopTrackFeatures( prevTopTrackFeatures =>
            {
                let newTopTrackFeatures = [...prevTopTrackFeatures, response.data]
                setTopTrackFeatures(newTopTrackFeatures)
                return [...prevTopTrackFeatures, response.data]
            }
        )
    }

    /* Can only provide 5 seed values
        Randomly Generate how many tracks and artists to provide */
    async function getRecommendations () {
        const headers = {
            Authorization: 'Bearer ' + accessToken
        };
        let recURI = "https://api.spotify.com/v1/recommendations"
        const topArtists = JSON.parse(localStorage.getItem("topArtists"))
        const topTracks = JSON.parse(localStorage.getItem("topTracks"))
        const calculatedTastes = JSON.parse(localStorage.getItem("sonicTaste"));
        setCurrentSonicTaste(calculatedTastes)
        const randArtist =  Math.floor(Math.random() * 5); 
        const randTrack =  Math.floor(Math.random() * 5); 
        
        // Add Seed Tracks
        recURI += "?seed_artists="+topArtists[randArtist]
        
        
        // Add Artists Tracks
        recURI += "&seed_tracks="+topTracks[randTrack]


        // Set Danceability Range
        // recURI += "&min_danceability=" + calculatedTastes.danceability.low 
        // recURI += "&max_danceability=" + calculatedTastes.danceability.high
     

        // // Set Energy Range
        // recURI += "&min_energy=" + calculatedTastes.energy.low 
        // recURI += "&max_energy=" + calculatedTastes.energy.high

        // // Set Tempo Range
        // recURI += "&min_tempo=" + calculatedTastes.tempo.low 
        // recURI += "&max_tempo=" + calculatedTastes.tempo.high


        // // Set Valence Range
        // recURI += "&min_valence=" + calculatedTastes.valence.low 
        // recURI += "&max_valence=" + calculatedTastes.valence.high

        const response = await axios.get(recURI, {headers});
        const tracks = response.data.tracks
        //const images = tracks.map(track => track.album.images[1].url)
         const images = tracks.map(track => ({
            imageUrl: track.album.images[0].url,
            uri: track.uri,
            name: track.name,
            artist: track.artists[0].name

        }));
        setRecImagesUrls(images)
        setRecommendations(tracks)
    }

    /* Gets the user's profile, used for getting userID*/
    async function getUserProfile() {
        const userURI = "https://api.spotify.com/v1/me"
        const headers = { Authorization: 'Bearer ' + accessToken   };
        const response = await axios.get(userURI,{headers});
        setUserID(response.data.display_name);
    }

    /* Gets the ID of the active spotify player*/
    async function getPlayer() {
        const playerURI = "https://api.spotify.com/v1/me/player/devices"
        const headers = { Authorization: 'Bearer ' + accessToken };
        const repsonse = await axios.get(playerURI,{headers});
    }

    /* Updates artist dropdown with artists from spotify API */
    useEffect( () => {
        setArtistList(Array.from(userArtists.keys()));
    },[userArtists])

    /* Updates track dropdown with artists from spotify API */
    useEffect( () => {
        setTrackList(Array.from(userSongs.keys()));
    },[userSongs])


    
    /* Initial Data Parsing and token generation */
    useEffect( () => {
        refresh()
        if(accessToken !== null) {
            console.log(accessToken)
            getUserProfile()
            generateRecommendations()
            storeArtistsAndTracks()
        }
    },[])

    useEffect( () => {
        if(accessToken !== null) {
            getUserProfile()
            generateRecommendations()
            storeArtistsAndTracks()
        }
    },[accessToken])

    /* Grab image blobs (binary large object) from the list of urls (recImageUrls)
        Also populates an object with artist and track name */
    useEffect( () => {
        const fetchImages = async () => {
            if(recImagesUrls.length > 0){
                const imagePromises = recImagesUrls.map(async (image) => {
                    const response = await fetch(image.imageUrl);
                    const blob = await response.blob();
                    const blobWithUri = {
                        blob: URL.createObjectURL(blob),
                        uri: image.uri,
                        name: image.name,
                        artist: image.artist
                    }
                    return blobWithUri;
                    });
        
                const fetchedImages = await Promise.all(imagePromises);
                setRecImages(fetchedImages);
            }   
          };
      
          fetchImages();
    },[recImagesUrls])

    /* Update the user's musical averages */ 
    useEffect ( () => {
        if (topTrackFeatures.length === NUM_SONGS_RETRIEVED_FROM_SAVED) {
            let danceability = []
            let energy = []
            let tempo = []
            let valence = []
            topTrackFeatures.forEach( track => {
                danceability.push(track.danceability)
                energy.push(track.energy)
                tempo.push(track.tempo)
                valence.push(track.valence)
            })

            const sonicTaste = {
                danceability : {
                    avg: statistics.mean(danceability), 
                    low: statistics.quantile(danceability,0.1),
                    high: statistics.quantile(danceability,0.9),
                },
                energy : {
                    avg: statistics.mean(energy), 
                    low: statistics.quantile(energy,0.1),
                    high: statistics.quantile(energy,0.9),
                }, 
                tempo : {
                    avg: statistics.mean(tempo), 
                    low: statistics.quantile(tempo,0.1),
                    high: statistics.quantile(tempo,0.9),
                }, 
                valence : {
                    avg: statistics.mean(valence), 
                    low: statistics.quantile(valence,0.1),
                    high: statistics.quantile(valence,0.9),
                }, 
            }
            localStorage.setItem("sonicTaste", JSON.stringify(sonicTaste))
        }

    }, [topTrackFeatures])

    // Create playlist here
    const onSubmit = async (data) => {
        const currentDate = new Date();
        const headers = {
            Authorization: 'Bearer ' + accessToken
        };
        const playlistURI = "https://api.spotify.com/v1/users/"+ userId + "/playlists"
        const body = {
            name : "Playlist generated on " + currentDate.getMonth() + "/" + currentDate.getDate(),
            description: "Generated from these attributes: ",
            public: false
        }

        // Need to find out what data to send to recommender 
        const recURL = await getRecURL(data)
        console.log(recURL)

        const recs = await axios.get(recURL, {headers}).catch( (error) => console.log(error))
        
        const tracks = recs.data.tracks
        //const images = tracks.map(track => track.album.images[1].url)

        console.log(recs)
         const images = tracks.map(track => ({
            imageUrl: track.album.images[0].url,
            uri: track.uri,
            name: track.name,
            artist: track.artists[0].name

        }));
        setRecImagesUrls(images)
        setRecommendations(tracks)
      };

    async function getRecURL(data) {
        let recURL = "https://api.spotify.com/v1/recommendations?"
        /* First field to add is prefixed by ?, all subsequent is prefixed by &. Use this variable to see if we need to add a & or not*/
        let addedOneField = false 

        if ( fieldExists(data.artists) ){
            recURL += "seed_artists="+ userArtists.get(data.artists[0].name.value)
        }

        if ( fieldExists(data.tracks) ){
            recURL += "&seed_tracks="+ userSongs.get(data.tracks[0].name.value)
        }


        if ( fieldExists(data.Danceability) ) { 
            let danceabilityRange = DEFAULT_RANGE
            if (fieldExists(data.DanceabilityRange)){
                danceabilityRange = parseFloat(data.DanceabilityRange)
            }
            const max_danceability = parseFloat(data.Danceability) + danceabilityRange
            const min_danceability = parseFloat(data.Danceability) - danceabilityRange

            recURL += "&max_danceability="  +max_danceability
            recURL += "&min_danceability=" + min_danceability
            addedOneField = true
        }

        if ( fieldExists(data.Valence) ) { 
            let valenceRange = DEFAULT_RANGE
            if (fieldExists(data.ValenceRange)){
                valenceRange = parseFloat(data.ValenceRange)
            }
            const max_valence= parseFloat(data.Valence) + valenceRange
            const min_valence = parseFloat(data.Valence) - valenceRange

            if(!addedOneField) {recURL += "&"}

            recURL += "max_valence=" + max_valence
            recURL += "&min_valence=" + min_valence
        }

        if ( fieldExists(data.Energy) ) { 
            let energyRange = DEFAULT_RANGE
            if (fieldExists(data.EnergyRange)){
                energyRange = parseFloat(data.EnergyRange)
            }
            const max_energy = parseFloat(data.Energy) + energyRange
            const min_energy = parseFloat(data.Energy) - energyRange

            if(!addedOneField) {recURL += "&"}
            recURL += "max_valence=" + max_energy
            recURL += "&min_energy=" + min_energy
        }

        if ( fieldExists(data.Tempo) ) { 
            let tempoRange = DEFAULT_RANGE
            if (fieldExists(data.TempoRange)){
                tempoRange = parseFloat(data.TempoRange)
            }
            const max_tempo = parseFloat(data.Tempo) + tempoRange
            const min_tempo = parseFloat(data.Tempo) - tempoRange

            if(!addedOneField) {recURL += "&"}
            recURL += "max_valence=" + max_tempo
            recURL += "&min_energy=" + min_tempo
        }


        return recURL

    }

    function fieldExists(field){
        return field !== undefined && field.length > 0
    }

    const { register, handleSubmit, formState: { errors }, control } = useForm();
    const { fields: artistFields, append: appendArtist, remove: removeArtist } = useFieldArray({
        control,
        name: "artists",
    });

    const { fields: trackFields, append: appendTrack, remove: removeTrack } = useFieldArray({
        control,
        name: "tracks",
    });

    if(recImages.length > 0){
        return(
         <RecommendationDeck recs={recImages} accessToken={accessToken} userId={userId} /> 
        )
    } else {

    return(
        <div className="generate-recs-wrapper">
            <div className="form-wrapper">
                <form onSubmit={handleSubmit(onSubmit)} className="form-elem">

                <label>Artists:</label>
                <ul className="list-wrapper">
                    {artistFields.map((field, index) => (
                        <li key={field.id} className="artist-container" >
                            <Controller name={`artists[${index}].name`} control={control}  defaultValue={field.name}
                                render={({ field }) => (
                                    <div className="dropdown-wrapper">
                                        <Select
                                            {...field}
                                            options={artistList.map((option) => ({
                                                value: option,
                                                label: option,
                                            }))}
                                            isSearchable={true}
                                            placeholder="Select an artist..." 
                                            className ="generic-dropdown"/>
                                        <button type="button" className="remove-button" onClick={() => removeArtist(index)}> X  </button>
                                    </div> )} />
                        </li> ))}
                </ul>

                <button type="button" className="add-button" onClick={() => appendArtist({ name: "" })}> Add Artist  </button>
                <label>Tracks:</label>
                <ul className="list-wrapper">
                    {trackFields.map((field, index) => (
                        <li key={field.id} className="track-container">
                            <Controller name={`tracks[${index}].name`} control={control}  defaultValue={field.name}
                                render={({ field }) => (
                                    <div className="dropdown-wrapper">
                                        <Select {...field}
                                            options={trackList.map((option) => ({
                                                value: option,
                                                label: option, }))}
                                            isSearchable={true} className="generic-dropdown" placeholder="Select a track..." />
                                        <button type="button"  className="remove-button" onClick={() => removeTrack(index)} > X  </button>
                                    </div>)} />
                        </li> ))}
                </ul>

                <button type="button" className="add-button" onClick={() => appendTrack({ name: "" })}> Add Track  </button>
                
                <label>Valence</label>
                <input className="taste-input"
                    placeholder={
                        currentSonicTaste !== null
                        ? "Your average Valence: " + currentSonicTaste.valence.avg.toFixed(4)
                        : "Default Placeholder Value"
                    } {...register("Valence")}   />
                <input className="taste-input" placeholder="Default Valence Range: .3" {...register("ValenceRange")} />

                <label>Danceability</label>
                <input className="taste-input" placeholder={
                        currentSonicTaste !== null
                        ? "Your average Danceability: " + currentSonicTaste.danceability.avg.toFixed(4)
                        : "Default Placeholder Value"
                    } {...register("Danceability")}  />
                <input className="taste-input" placeholder="Default Danceability Range: .3" {...register("DanceabilityRange")} />

                <div className="taste-input-wrapper">
                <label>Energy</label> <input className="taste-input"
                    placeholder={
                        currentSonicTaste !== null
                        ? "Your average Energy: " + currentSonicTaste.energy.avg.toFixed(4)
                        : "Default Placeholder Value"
                    } {...register("Energy")}  />

                <input className="taste-input" placeholder="Default Energy Range: .3"  {...register("EnergyRange")} />
                </div>
                <label>Tempo</label>
                <input className="taste-input"
                    placeholder={
                        currentSonicTaste !== null
                        ? "Your average Tempo: " + currentSonicTaste.tempo.avg.toFixed(4)
                        : "Default Placeholder Value"
                    } {...register("Tempo")} />
                <input className="taste-input" placeholder="Default Tempo Range: .3" {...register("TempoRange")} />

                <button type="submit" className="generate-button"> Generate</button>
            </form>
            </div>
        );
        </div>
    )
                }

}

export default GenerateRecommendations;