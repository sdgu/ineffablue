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


/* GET home page. */
router.get('/', function(req, res, next) 
{
  res.render('index', { title: 'Express' });
});

router.get("/test", function(req, res, next)
{
	var testPoet = new Poet({name: "Pasta man"});

	testPoet.save(function(err)
	{
		if (err) throw err;
		console.log("nice");
	});
});

router.get("/poets", function(req, res, next)
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


router.get("/poets/:name", function(req, res)
{
	console.log(req.name);
	res.json(req.name);
})


module.exports = router;
