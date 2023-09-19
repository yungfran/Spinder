
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
