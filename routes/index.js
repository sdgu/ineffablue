var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");

var Poet = mongoose.model("Poet");

var Twit = require("twit");


// var T = new Twit(
// {
//   consumer_key: 'GTbThbc0xALAPEOj3innIr1Mz',
//   consumer_secret: 'BOFSlzT12vFqK0Z1MHa8Q7E27k10jMReyY87MUrpiivA1EEO2X',
//   access_token: '4897227735-qvmj8xrvhnrTv6AyEA2eBGYPoioDiGdZaa3LMBh',
//   access_token_secret: '8K1SlgUc70aHxTvGHCFxr5MRE7hqPmX04pmueb3Wg3H5F',
//   timeout_ms: 60*1000,
// });


var T = new Twit(
{
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000,
})

var stream = T.stream("statuses/filter", {track: "@ineffablue94"});
stream.on("tweet", function(tweet)
{
	//console.log(tweet);

	Poet.find(
	{
		id_str: tweet.user.id_str
	}, function(err, docs)
	{
		//console.log(docs);
		if (err) throw err;
		if (docs.length > 0)
		{
			console.log("user already exists");
			//do things like adding the tweet content to "lines"
			Poet.findOneAndUpdate(
			{
				id_str: tweet.user.id_str
			},
			{
				$push: {lines: tweet.id_str}
			}, function(err, docs)
			{
				if (err) throw err;
				else console.log(docs);
			})

		}
		else
		{
			var newPoet = new Poet(
			{
				name: tweet.user.name,
				id: tweet.user.id,
				id_str: tweet.user.id_str,
				screen_name: tweet.user.screen_name,
				lines: tweet.id_str
			});
			newPoet.save(function(err)
			{
				if (err) throw err;
				console.log("got a new user");
			})
		}
	});

});


//populate: .populate('_creator')




/* GET home page. */
router.get('/', function(req, res, next) 
{
  res.render('index', { title: 'Express' });
});

router.get("/test", function(req, res, next)
{
	var testPoet = new Poet({name: "dong2"});

	testPoet.save(function(err)
	{
		if (err) throw err;
		console.log("nice");
	});
});

router.get("/restful/poets", function(req, res, next)
{
	Poet.find(function(err, docs)
	{
		if (err) throw err;
		console.log(docs);
		res.send(docs);
	})
})


router.param("name", function(req, res, next, pname)
{
	var query = Poet.findOne({"name" : pname});

	query.exec(function(err, name)
	{
		if (err) return next(err);
		if (!name) return next(new Error("rip"));

		req.name = pname;
		return next();
	});
})


router.get("/restful/poets/:name", function(req, res)
{
	console.log(req.name);
	res.json(req.name);
})


module.exports = router;
