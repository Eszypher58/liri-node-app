var config = require("./keys.js");
var Twit = require("twit");
var Spotify = require("node-spotify-api");
var request = require("request");
var fs = require("fs");

var cmd = process.argv[2];
var param = process.argv[3];
var twitter = new Twit({

	consumer_key: config.twitterKeys.consumer_key,
	consumer_secret: config.twitterKeys.consumer_secret,
	access_token: config.twitterKeys.access_token_key,
	access_token_secret: config.twitterKeys.access_token_secret,

});

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

function writeTriviaTwitter(category) {

	var queryTrivia = "https://opentdb.com/api.php?amount=1&category=" + category + "&difficulty=hard&type=multiple"

	request(queryTrivia, function(err, response, body){

		if (!err && response.statusCode === 200) {

			//console.log(JSON.parse(body).results);
			var array = JSON.parse(body).results;

			//console.log(array.length)

			if (array.length === 0) {

				//console.log(array[i].question);

					var q = { status: "My bot is still thinking... Try again later!"}
					postTweet(q);

			} else {

				for (var i = 0; i < array.length; i++) {

					//console.log(array[i].question);

					var q = { status: array[i].question }
					postTweet(q);

				}


			}

						
		}

	})

}

//writeTriviaTwitter();

function queryTwitter() {

	var query = { user_id: '@jd668899', screen_name: "john doe" }

	twitter.get('statuses/user_timeline',
				query,
				function(err, data, response) {
					
					if (err) {
	      			
	      				console.log(err)
	      			
	      			} else {

	      				

	      				for (var i = 0; i < data.length; i++) {

	      					console.log(data[i].created_at);
	      					console.log(data[i].text);
	      					//write to log file

	      				}


	      			}
				})
		
}

//queryTwitter();

function querySpotify(searchTerm) {

	var spotify = new Spotify({

		id: config.spotifyKeys.id,
		secret: config.spotifyKeys.secret,
	
	});

	spotify.search({
		type: "track",
		query: searchTerm,
		limit: 1,
		//artist: artists,

	}).then(function(response){

		//console.log(JSON.stringify(response, null, 2));

		var artists = response.tracks.items[0].artists[0].name;
		var name = response.tracks.items[0].name;
		var previewLink = response.tracks.items[0].preview_url;
		var album = response.tracks.items[0].album.name;

		var dataArray = [artists, name, previewLink, album];

		logToFile(dataArray);

		console.log(artists);
		console.log(name);
		console.log(previewLink);
		console.log(album);
		//console.log(JSON.stringify(previewLink, null, 2));
		//console.log(JSON.stringify(album, null, 2));

	})

}

//console.log(typeof(param));

//querySpotify("I Want it That Way");

function queryMovie(searchTerm) {

	var movieName = searchTerm.replace(" ", "_");
	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=40e9cece";

	console.log(movieName);

	request(queryUrl, function(error, response, body){

		if (!error && response.statusCode === 200) {

			if (JSON.parse(body).Response === "False") {

				console.log(JSON.parse(body).Error);

			} else {

				//console.log(JSON.parse(body));

				var title = JSON.parse(body).Title;	
				var year = JSON.parse(body).Year;
				var imdbRating = JSON.parse(body).imdbRating;
				var rottenTomato = JSON.parse(body).Ratings[1].Value;
				var country = JSON.parse(body).Country;
				var lang = JSON.parse(body).Language;
				var plot = JSON.parse(body).Plot;
				var actors = JSON.parse(body).Actors;
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

function doWhatItSays() {

	fs.readFile("random.txt", "utf8", function(err, data){

		if(err) {

			console.log(err);

		} else {

			var result = data.split(",");
			console.log(result);
			startLiri(result[0],result[1]);

		}

	})

}

function logToFile(dataArray) {

	for (var i = 0; i < dataArray.length; i++) {

	fs.appendFile("log.txt", dataArray[i] + "\n" ,"utf8", function(err){

		if(err) {

			console.log(err);

		} else {

			//var result = data.split(",");
			//console.log("Data written");
			//startLiri(result[0],result[1]);

		}

	})

	}


}

function startLiri(instruction, parameter) {

	if (instruction === "my-tweets") {

		queryTwitter();

	}

	if (instruction === "tweet-trivia") {

		var cat = (Math.floor(Math.random() * 20) + 1).toString();
		//console.log(cat);
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