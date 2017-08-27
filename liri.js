//define node.js required modules and configurations
var config = require("./keys.js");
var Twit = require("twit");
var Spotify = require("node-spotify-api");
var request = require("request");
var fs = require("fs");

//obtain inputted command and parameter to liri
var cmd = process.argv[2];
var param = process.argv[3];

//Construct Twitter to allow authentication/post/get
var twitter = new Twit({

	consumer_key: config.twitterKeys.consumer_key,
	consumer_secret: config.twitterKeys.consumer_secret,
	access_token: config.twitterKeys.access_token_key,
	access_token_secret: config.twitterKeys.access_token_secret,

});

//post query to twitter account associated with the Oauth key/secret
function postTweet(query) {

	twitter.post('statuses/update',
				query,
				function(err, data, response) {
						
					if (err) {
		      			
		      			console.log(data)
		      			
		      		} else {

		      		}
				
				})

}

//tweets one trivia question from openTriviaDb to twitter account associated with Oauth
function writeTriviaTwitter(category) {

	var queryTrivia = "https://opentdb.com/api.php?amount=1&category=" + category + "&difficulty=hard&type=multiple"

	request(queryTrivia, function(err, response, body){

		if (!err && response.statusCode === 200) {

			var array = JSON.parse(body).results;

			if (array.length === 0) {

				var q = { status: "My bot is still thinking... Try again later!" }
				
				postTweet(q);

			} else {

				for (var i = 0; i < array.length; i++) {

					var q = { status: array[i].question }
					
					postTweet(q);

				}

			}
			
		}

	})

}

//Display the last 20 tweets on terminal and log data to file
function queryTwitter() {

	var query = { user_id: '@jd668899', screen_name: "john doe" }

	twitter.get('statuses/user_timeline',
				query,
				function(err, data, response) {
					
					if (err) {
	      			
	      				console.log(err)
	      			
	      			} else {

	      				for (var i = 0; i < data.length; i++) {

	      					var time = "Created at: " + data[i].created_at;
	      					var text = "Tweet content: " + data[i].text;
	      					var dataArray = [time, text];

	      					logToFile(dataArray);

	      					console.log(time);
	      					console.log(text);   					

	      				}

	      		
	      			}

				})
		
}

//Based on searchTerm, use node-spotify-api to return isplay artist, name, preview link, and album name to console and log the data to file
function querySpotify(searchTerm) {

	var spotify = new Spotify({

		id: config.spotifyKeys.id,
		secret: config.spotifyKeys.secret,
	
	});

	spotify.search({
		type: "track",
		query: searchTerm,
		limit: 1,

	}).then(function(response){

		var artists = "Artists: " + response.tracks.items[0].artists[0].name;
		var name = "Track Name: " + response.tracks.items[0].name;
		var previewLink = "Preview Link: " + response.tracks.items[0].preview_url;
		var album = "Album Name: " + response.tracks.items[0].album.name;

		var dataArray = [artists, name, previewLink, album];

		logToFile(dataArray);

		console.log(artists);
		console.log(name);
		console.log(previewLink);
		console.log(album);

	})

}


//return a formmated time stamp like 2015-10-21 17:32:57
function timeStamp() {

	var d = new Date();
	var str = d.getFullYear() + "-" +
			  d.getMonth() + "-" +
			  d.getDate() + " " +
			  d.getHours() + ":" +
			  d.getMinutes() + ":" +
			  d.getSeconds();

	return str;

}

//Based on searchTerm, use request to query OMDB for information to output to console and log information to file
function queryMovie(searchTerm) {

	var movieName = searchTerm.replace(" ", "_");
	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=40e9cece";

	request(queryUrl, function(error, response, body){

		if (!error && response.statusCode === 200) {

			if (JSON.parse(body).Response === "False") {

				console.log(JSON.parse(body).Error);

			} else {

				var title = "Title: " + JSON.parse(body).Title;	
				var year = "Year: " + JSON.parse(body).Year;
				var imdbRating = "IMDB Rating: " + JSON.parse(body).imdbRating;
				var rottenTomato = "none";

				//take care of edge case where rotten tomato rating is not avilable
				if (JSON.parse(body).Ratings[1] != undefined) {

					rottenTomato = "Rotten Tomato Rating: " + JSON.parse(body).Ratings[1].Value

				};
				
				var country = "Country: " + JSON.parse(body).Country;
				var lang = "Language: " + JSON.parse(body).Language;
				var plot = "Plot: " + JSON.parse(body).Plot;
				var actors = "Actors: " + JSON.parse(body).Actors;
				var dataArray = [title, year, imdbRating, rottenTomato, country, lang, plot, actors];

				logToFile(dataArray);

				console.log(title);				
				console.log(year);
				console.log(imdbRating);
				console.log(rottenTomato);
				console.log(country);
				console.log(lang);
				console.log(plot);
				console.log(actors);
			
			}

		}

	})

}

//read command off of file random.txt and have liri perform the command written inside the file; currently only works with one command, need to be expanded
function doWhatItSays() {

	fs.readFile("random.txt", "utf8", function(err, data){

		if(err) {

			console.log(err);

		} else {

			var result = data.split(";");

			for (var i = 0; i < result.length; i ++) {

				var line = result[i].split(",");

				startLiri(line[0],line[1]);

			}

			

			//console.log(line);

			//startLiri(result[0],result[1]);

		}

	})

}

doWhatItSays();

//write the content of dataArray into a file called log.txt
function logToFile(dataArray) {

	for (var i = 0; i < dataArray.length; i++) {

		fs.appendFile("log.txt", 
		              timeStamp() + " >>> " + dataArray[i] + "\n", 
		              "utf8", 
		              function(err){

						if(err) {

							console.log(err);

						} else {

							//nothing is displayed to prevent spamming terminal

						}

		})

	}

}

//start Liri
function startLiri(instruction, parameter) {

	logToFile(["command: " + instruction, 
	           "parameter: " + parameter
	          ]);

	if (instruction === "my-tweets") {

		queryTwitter();

	}

	if (instruction === "tweet-trivia") {

		var cat = (Math.floor(Math.random() * 20) + 1).toString();
		writeTriviaTwitter(cat);

	}
	
	if (instruction === "spotify-this-song") {

		if (parameter === undefined) {

			querySpotify("The Sign Ace of Base");

		} else {

			querySpotify(parameter);

		}

	}

	if (instruction === "movie-this") {

		if (parameter === undefined) {

			queryMovie("Mr. Nobody");

		} else {

			queryMovie(parameter);

		}

	}

	if (instruction === "do-what-it-says") {

		doWhatItSays();

	}

}

startLiri(cmd, param);

