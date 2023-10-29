var express = require('express'); 
var request = require('request'); 
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
require('dotenv').config();

CLIENT_ID = process.env.CLIENT_ID
CLIENT_SECRET = process.env.CLIENT_SECRET
REDIRECT_URI = process.env.REDIRECT_URI

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
  /*
   * Setup server with cors and cookie parser
   */
var stateKey = 'spotify_auth_state';
var app = express();
app.use(express.static(__dirname + '/public'))
.use(cors())
.use(cookieParser());


/**
 *  Call Login
 */
app.get('/login', function(req, res) {
 var state = generateRandomString(16);
 res.cookie(stateKey, state);
 console.log("Starting backend login");
 // your application requests authorization
 var scope = 'user-read-private user-read-email user-library-read user-top-read user-modify-playback-state user-read-playback-state playlist-modify-private playlist-modify-public';
 res.redirect('https://accounts.spotify.com/authorize?' +
   querystring.stringify({
     response_type: 'code',
     client_id: CLIENT_ID,
     scope: scope,
     redirect_uri: REDIRECT_URI,
     state: state
   }));
});


/**
 * Callback
 */
app.get('/callback', function(req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter
    
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
  
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        },
        json: true
      };
  
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
          var access_token = body.access_token,
              refresh_token = body.refresh_token;
  
          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };
  
          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {
            console.log(body);
          });
  
          // we can also pass the token to the browser to make requests from there
          const absoluteURL = 'http://localhost:3000/search?' +  
            querystring.stringify({ access_token: access_token }) + '&' + 
            querystring.stringify({refresh_token: refresh_token});
     
          res.redirect(absoluteURL);
        
        } else {
          res.redirect('http://localhost:3000/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  });


  app.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
    console.log("about to send refresh request")
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        console.log("refresh successful, about to send token")
        res.send({
          'access_token': access_token
        });
      } else {
        console.log("ERROR REFRESHING TOKEN ")
        console.log(response.statusCode);
      }
    });
  });
  
  console.log('Listening on 8888');
  app.listen(8888);
  
  


