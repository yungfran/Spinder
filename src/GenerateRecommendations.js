import axios from "axios";
import { useEffect, useState } from "react";
import * as statistics from 'simple-statistics';
import RecommendationDeck from "./RecommendationDeck";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import CustomizeRecs from './CustomizeRecs';
import "./LoggedIn.css"
import Select from "react-select";

// Need sonic taste, userID, accessToken, list of artists, list of tracks, map of artists/tracks : id
function GenerateRecommendations (  {sonicTaste, uid, artists, tracks, songToID, artistToID, token}  ) {

    const [accessToken, setAccessToken] = useState(token);
    const [currentSonicTaste, setCurrentSonicTaste] = useState(sonicTaste);
    const [userId, setUserID] = useState(uid)
    const [artistList, setArtistList] = useState(artists) /* List of all artists saved from user's songs in array form*/
    const [trackList, setTrackList] = useState(tracks) /* List of all artists saved from user's songs in array form*/
    const [userSongs, setUserSongs] = useState(songToID); /* Stores the songs the user has saved to savedSongs */
    const [userArtists,setUserArtists] = useState(artistToID); /* All artists inside the users saved songs ArtistName: ArtistID*/
    const DEFAULT_RANGE = 0.15


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
        console.log(recs)
        // Create Playlist
        // const createPlaylistResponse = await axios.post(playlistURI,body,{headers}).catch( (error) => console.log(error));
        console.log(data)
      };

    useEffect( () => {
        console.log(artistList)
    },[])

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
            // console.log(parseFloat(data.Danceability) + danceabilityRange)

            recURL += "&max_danceability="  +max_danceability
            recURL += "&min_danceability=" + min_danceability
            addedOneField = true
        }
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

    if(accessToken === null){

        return(
            <div className="Yak">
                <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Artists:</label>
        <ul>
            {artistFields.map((field, index) => (
                <li key={field.id}>
                    <Controller
                        name={`artists[${index}].name`}
                        control={control}
                        defaultValue={field.name}
                        render={({ field }) => (
                            <div>
                                <Select
                                    {...field}
                                    options={artistList.map((option) => ({
                                        value: option,
                                        label: option,
                                    }))}
                                    isSearchable={true}
                                    placeholder="Select an artist..."
                                />
                                <button
                                    type="button"
                                    className="remove-button"
                                    onClick={() => removeArtist(index)}
                                >
                                    X
                                </button>
                            </div>
                        )}
                    />
                </li>
            ))}
        </ul>
        <button type="button" onClick={() => appendArtist({ name: "" })}>
            Add Artist
        </button>
    
        <label>Tracks:</label>
        <ul>
            {trackFields.map((field, index) => (
                <li key={field.id}>
                    <Controller
                        name={`tracks[${index}].name`}
                        control={control}
                        defaultValue={field.name}
                        render={({ field }) => (
                            <div>
                                <Select
                                    {...field}
                                    options={trackList.map((option) => ({
                                        value: option,
                                        label: option,
                                    }))}
                                    isSearchable={true}
                                    placeholder="Select a track..."
                                />
                                <button
                                    type="button"
                                    className="remove-button"
                                    onClick={() => removeTrack(index)}
                                >
                                    X
                                </button>
                            </div>
                        )}
                    />
                </li>
            ))}
        </ul>
        <button type="button" onClick={() => appendTrack({ name: "" })}>
            Add Track
        </button>
                    
                    <label>Valence</label>
                    <input
                        className="taste-input"
                        placeholder={
                            currentSonicTaste !== null
                            ? "Average Valence: " + currentSonicTaste.valence.avg.toFixed(4)
                            : "Default Placeholder Value"
                        }
                            {...register("Valence")} 
                    />
                    <input className="taste-input" placeholder="Default Valence Range: .3" {...register("ValenceRange")} />
    
                    <label>Danceability</label>
                    <input
                        className="taste-input"
                        placeholder={
                            currentSonicTaste !== null
                            ? "Average Danceability: " + currentSonicTaste.danceability.avg.toFixed(4)
                            : "Default Placeholder Value"
                        }
                            {...register("Danceability")} 
                    />
                    <input className="taste-input" placeholder="Default Danceability Range: .3" {...register("DanceabilityRange")} />
    
                    
                    <label>Energy</label>
                    <input
                        className="taste-input"
                        placeholder={
                            currentSonicTaste !== null
                            ? "Average Energy: " + currentSonicTaste.energy.avg.toFixed(4)
                            : "Default Placeholder Value"
                        }
                            {...register("Energy")} 
                    />
                    <input className="taste-input" placeholder="Default Energy Range: .3"  {...register("EnergyRange")} />
                    
                    <label>Tempo</label>
                    <input
                        className="taste-input"
                        placeholder={
                            currentSonicTaste !== null
                            ? "Average Tempo: " + currentSonicTaste.tempo.avg.toFixed(4)
                            : "Default Placeholder Value"
                        }
                            {...register("Tempo")} 
                    />
                    <input className="taste-input" placeholder="Default Tempo Range: .3" {...register("TempoRange")} />
    
    
                    <button type="submit">Generate</button>
                </form>
                </div>
            );
                
                {/* <RecommendationDeck recs={recImages} accessToken={accessToken} /> */}
            </div>
        )
                    } else {
                        return(
                            <div>
                                Hi
                            </div>
                        )
                    }


}

export default GenerateRecommendations;