import axios from "axios";
import { useEffect, useState } from "react";
import * as statistics from 'simple-statistics';

/* Props store access and refresh token*/
function LoggedIn( props ) {

    const [accessToken,setAccess] = useState(props.access)
    const [refreshToken,setRefresh] = useState(props.refresh)
    const [userSongs, setUserSongs] = useState(new Set()); /* Stores the songs the user has saved to playlist */
    const [userArtists,setUserArtists] = useState(new Map()); /* Used for genre counts */
    const [genreCounts, setGenreCounts] = useState(new Map()); /* Counts the genres the user listens to */

    const [topTrackFeatures, setTopTrackFeatures] = useState([]);

    const [currentSonicTaste, setCurrentSonicTaste] = useState([]);

    const [recommendations, setRecommendations] = useState([]);

    const [recImagesUrls, setRecImagesUrls] = useState([]);

    const [recImages, setRecImages] = useState([]);

    const NUM_SONGS_RETRIEVED_FROM_SAVED = 20


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
            setAccess(response.data.access_token)
        }
    }

    async function getHeader() {
        const headers = {
            Authorization: 'Bearer ' + accessToken
        };

        return headers;
    }

     /* End Access functions */

     /* Begin parsing user data */
     /* Stores all playlistIds and sends to parsePlaylists() */
    // async function getPlaylists() {
    //     const userPlaylistURI =  "https://api.spotify.com/v1/me/playlists?limit=50"
    //     const headers = {
    //         Authorization: 'Bearer ' + accessToken
    //     };
    //     const response = await axios.get(userPlaylistURI, {headers})
    //     let nextUserPlaylistURI = response.data.next;
    //     let currPlaylistIDs = []
    //     response.data.items.forEach(playlist => currPlaylistIDs.push(playlist.tracks.href))
        
    //     /* As long as we have more requests make, send them*/
    //     if (nextUserPlaylistURI) {
    //         const nextPlaylistResponse = await axios.get(nextUserPlaylistURI, {headers})
    //         nextUserPlaylistURI = nextPlaylistResponse.data.next
    //         nextPlaylistResponse.data.items.forEach( playlist => currPlaylistIDs.push(playlist.tracks.href))
    //     }
        
    //     return currPlaylistIDs;
    // }

    // /* Entry point into reading the user's playlists. Should only happen once*/
    // /* TODO: Fix getting artists and songs at the same time, best outcome in one call*/
    // async function parsePlaylists() {
    //     const seenUser = localStorage.getItem("songs");
    //     const seenArtists = localStorage.getItem("albums")

    //     console.log(accessToken)
    //     if (seenArtists !== null){
    //         console.log("getting all playlists")
    //         const playlists = await getPlaylists();
    //         const headers = {
    //             Authorization: 'Bearer ' + accessToken
    //         };
    //         // Call parsePlaylist using map and get a promise
    //         const parsePromises = playlists.map(playlist => parsePlaylist(playlist)); // Create an array of promises
            
    //         // Wait until every we finish every parsePlaylist call
    //         await Promise.all(parsePromises);
            
    //         localStorage.setItem("songs",Array.from(userSongs))
    //         const artistObject = Object.fromEntries(userArtists);
    //         localStorage.setItem('artists', JSON.stringify(artistObject));

    //     } else {
    //         console.log("Grabbed playlists from local ")
    //         const songs = seenUser.split(',');
    //         setUserSongs(new Set(songs))


    //         const retrievedMapString = localStorage.getItem('artists');
    //         const retrievedMapObject = JSON.parse(retrievedMapString);
    //         const retrievedMap = new Map(Object.entries(retrievedMapObject));
    //         setUserArtists(retrievedMap)
    //     }

    //     // Now all parsePlaylist calls have finished, you can call your additional function here
    //     // await getGenres();
    //     await getSavedSongs()
    // }

    // /* Gets all songs from a playlist and adds it to our songs set
    //    Gets all albums of those songs and store the counts in our album map*/
    //    /* WORKING ON GETTING ARTISTS INTO A LIST SO THAT WE CAN GET GENRES FROM IT*/
    // async function parsePlaylist(playlistURI) {
    //     const headers = {
    //         Authorization: 'Bearer ' + accessToken
    //     };
    //     const response = await axios.get(playlistURI, {headers});
    //     setUserArtists(prevUserArtist => {
    //         const newArtists = new Map(prevUserArtist);
    //         console.log(response.data.items);
    //         response.data.items.forEach(trackData => {
    //         if (trackData.track !== null && trackData.track !== undefined) {
    //             if (trackData.track.artists !== null && trackData.track.artists !== undefined) {
    //                 if(trackData.track.artists[0] !== null ){
    //                     const artistId = trackData.track.artists[0].id;
    //                     if(artistId !== null){
    //                         if (newArtists.has(artistId)) {
    //                             newArtists.set(artistId, newArtists.get(artistId) + 1);
    //                         } else {
    //                             newArtists.set(artistId, 1);
    //                         }
    //                 }
    //              }
    //             }
    //         }
    //         });
            
    //         setUserArtists(newArtists)
    //         return newArtists
    //       });


    //     // setUserSongs(prevUserSongs => {
    //     //     const newSongIds = response.data.items.map(trackData => trackData.track.id);
    //     //     setUserSongs(new Set([...prevUserSongs, ...newSongIds]));
    //     //     return new Set([...prevUserSongs, ...newSongIds]);
    //     // });
    // }

    // /* End parsing user data*/



    // /* Calculate User Tastes */
    // async function getGenres() {
    //     console.log("Calculating genres")
    //     let albumsURI = "https://api.spotify.com/v1/artists?ids="
    //     const headers = {
    //         Authorization: 'Bearer ' + accessToken
    //     };

    //     const albumsPerRequest = 10;
    //     const albumsList = Array.from(userArtists.keys())
    //     const requestCount = Math.ceil(userArtists.size / albumsPerRequest);
    //     for(let i = 0; i < requestCount; i += 1){
    //         const currAlbumIDs = albumsList.slice(i, i + albumsPerRequest);
    //         currAlbumIDs.forEach(albumId => albumsURI += albumId +",")
    //         albumsURI = albumsURI.substring(0,albumsURI.length - 1)
    //         const response = await axios.get(albumsURI,{headers})

    //         const artists = response.data.artists;
    //         console.log(artists)
    //         const genrePromise = artists.map(artist => parseGenreFromArtist(artist));

    //         albumsURI = "https://api.spotify.com/v1/artists?ids=";
    //     }
    // }

    // /* Looks at a single artist and updates the current genre count for the user
    //     For now pick genre[0] */
    // async function parseGenreFromArtist(artist) {
    //     const genres = artist.genres
    //     const artistCount = userArtists.get(artist)

    //     setGenreCounts( prevGenreCounts => {
    //         let newGenreCounts = new Map(prevGenreCounts);
    //         genres.map(genre => {
    //             if (newGenreCounts.has(genre)){
    //                 newGenreCounts.set(genre, newGenreCounts.get(genre) + artistCount)
    //             } else {
    //                 newGenreCounts.set(genre,artistCount);
    //             }
    //         })
    //         setGenreCounts(newGenreCounts)
    //         return newGenreCounts
    //     });

    // }

    // /* Calculates the user's favorite genres*/
    // /* Assumes an ID is always 22 characters + 1 character for the comma*/
    // async function calculateTaste () {
    //    const songsPerRequest = 20
    //    const allSongsString = localStorage.getItem("songs");
    //    const startingSongURI = "https://api.spotify.com/v1/tracks?ids=" 
    //    const charactersPerCall = 23 * songsPerRequest;
    //    const numCalls = Math.ceil(allSongsString.length / 23 / songsPerRequest);
    //    console.log(allSongsString)
    //    // On the nth, cut it off at the length of allSongStrings
    //    for(let offset = 0; offset < (numCalls - 1); offset += 1){
    //         let start = offset * charactersPerCall;
    //         let end = (offset + 1) * charactersPerCall - 1;

    //         getSong(startingSongURI+allSongsString.substring(start,end));
    //    }

    //    //const songPromises = Array.from(userSongs).map(songId => getSong(songId))
    // }

    // async function getSavedSongs() {
    //     const headers = {
    //         Authorization: 'Bearer ' + accessToken
    //     };
    //     const savedSongsURI = "https://api.spotify.com/v1/me/tracks"
    //     let response = await axios.get(savedSongsURI,{headers})
    //     console.log(response)
    //     let nextSongsURI = response.data.next;
    //     while (nextSongsURI !== null) {
    //         response = await axios.get(nextSongsURI,{headers});
    //         console.log(response)
    //         nextSongsURI = response.data.next;
    //     }
    // }

    // /* Given a song's spotify URI, return the */
    // async function getSong (songURI) {
    //     console.log("Grabbing data for "  + songURI)
    //     const headers = {
    //         Authorization: 'Bearer ' + accessToken
    //     };
    //     const response = await axios.get(songURI,{headers})
    //     console.log(response.data.tracks[1].artists)
    // }

    async function generateRecommendations() {
       await analyzeSonicTastes();
       await getRecommendations();
    }

    async function analyzeSonicTastes () {
        const calculatedTastes = localStorage.getItem("sonicTaste");
        if (calculatedTastes === null || calculatedTastes === undefined){
            console.log("calculating tastes")
            await getTopSongsArtists("short_term")
        } else {
            console.log("doing nothing, already calculated")
        }
    }

    /* Gets top songs for the term, 
     Term is long_term, medium_term, short_term 
    With top songs / artists, use them to feed into rec system
    */
    async function getTopSongsArtists(term) {
        if(topTrackFeatures.length === 20) {
            return
        }
        const headers = {
            Authorization: 'Bearer ' + accessToken
        };
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
        Randomly Generate how many tracks and artists to provide*/
    async function getRecommendations () {
        const headers = {
            Authorization: 'Bearer ' + accessToken
        };
        let recURI = "https://api.spotify.com/v1/recommendations"
        const topArtists = JSON.parse(localStorage.getItem("topArtists"))
        const topTracks = JSON.parse(localStorage.getItem("topTracks"))
        const calculatedTastes = JSON.parse(localStorage.getItem("sonicTaste"));
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
        const images = tracks.map(track => track.album.images[1].url)
        setRecImagesUrls(images)
        setRecommendations(tracks)
    }

    
    useEffect( () => {
        refresh()
    },[])

    // Grab image blobs (binary large object) from the list of urls (recImageUrls)
    useEffect( () => {
        const fetchImages = async () => {
            if(recImagesUrls.length > 0){
                console.log(recImagesUrls)
                const imagePromises = recImagesUrls.map(async (imageUrl) => {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                return URL.createObjectURL(blob);
                });
        
                const fetchedImages = await Promise.all(imagePromises);
                setRecImages(fetchedImages);
                console.log(recImages)
            }   
          };
      
          fetchImages();
    },[recImagesUrls])

    // Set the user's sonic preferences
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


    // useEffect( () => {
    // },[userSongs])

    return(
        <div className="Yak">
            <button onClick={generateRecommendations}>
                Get Recs        
            </button>
            {/* <ul>
                {recommendations.map(rec => (
                    <li key ={rec.id}>
                        Song: {rec.name}   ,
                        Artist: {rec.artists[0].name}   , 
                        Playurl: {rec.external_urls.spotify}

                    </li>
                ))}
            </ul> */}
      {/* <div>
        {recImages.map((imageSrc, index) => (
          <img key={index} src={imageSrc} alt={`Image ${index}`} />
        ))}
      </div> */}
           
        </div>
    )


}

export default LoggedIn;