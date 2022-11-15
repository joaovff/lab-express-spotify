require("dotenv").config();

const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

let currentArtistName = null;

app.set("views", __dirname + "/views");
app.set("view engine", "hbs");
app.use(express.static(__dirname + "/public"));

// Register the location for handlebars partials here:
hbs.registerPartials(__dirname + "/views/partials");

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrongh when retrieving an access token", error)
  );

//your routes goes here
app.get("/", (request, response) => {
  console.log("the request url:", request.url);
  response.render("index");
});

app.get("/artist-search", async (req, res) => {
  try {
    const data = await spotifyApi.searchArtists(req.query.artistName);

    const pageData = {
      name: data.body.artists.items[0].name,
      img: data.body.artists.items[0].images[0].url,
      id: data.body.artists.items[0].id,
    };
    currentArtistName = pageData.name;
    res.render("artist-search-results", pageData);
  } catch (error) {
    console.log(error);
  }
});

app.get("/albums/:id", async (req, res) => {
  try {
    const data = await spotifyApi.getArtistAlbums(req.params.id);

    const responseData = {
      albums: data.body.items,
      name: currentArtistName,
    };

    res.render("albums", responseData);
  } catch (error) {
    console.log(error);
  }
});

app.get("/album/tracks/:id", async (req, res) => {
  try {
    const data = await spotifyApi.getAlbumTracks(req.params.id);
    const responseData = {
      tracks: data.body.items,
    };

    //console.log(responseData);
    res.render("tracks", responseData);
  } catch (error) {
    console.log(error);
  }
});

app.listen(3002);
