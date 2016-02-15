var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");

var Poet = mongoose.model("Poet");
var FirstLine = mongoose.model("FirstLine");
var Line = mongoose.model("Line");
var Poem = mongoose.model("Poem");

var Twit = require("twit");


// var T = new Twit(
// {
//   consumer_key: 'GTbThbc0xALAPEOj3innIr1Mz',
//   consumer_secret: 'BOFSlzT12vFqK0Z1MHa8Q7E27k10jMReyY87MUrpiivA1EEO2X',
//   access_token: '4897227735-qvmj8xrvhnrTv6AyEA2eBGYPoioDiGdZaa3LMBh',
//   access_token_secret: '8K1SlgUc70aHxTvGHCFxr5MRE7hqPmX04pmueb3Wg3H5F',
//   timeout_ms: 60*1000,
// });

function afterSave(err)
{
	if (err) throw err;
}

function dateParse(date)
{

  var year = "" + date.getUTCFullYear();
  var month = date.getUTCMonth() + 1;
  month = "" + month;
  var day = date.getUTCDate();
  var hour = date.getUTCHours();

  day = day + "";

  hour = "" + hour;
  var minute = "" + date.getUTCMinutes();
  var sec = "" + date.getUTCSeconds();

  if (month.length === 1)
  {
    month = "0" + month;
  }
  if (day.length === 1)
  {
    day = "0" + day;
  }
  if (hour.length === 1)
  {
    hour = "0" + hour;
  }
  if (minute.length === 1)
  {
    minute = "0" + minute;
  }
  if (sec.length === 1)
  {
    sec = "0" + sec;
  }

  var fullDate = year + " " + month + " " + day + " " + hour + ":" + minute + ":" + sec;
  //alert(fullDate);
  return fullDate;
}

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
	console.log(tweet); //maybe different check for rt


	var tweetDate = dateParse(new Date());
	

	var tweetText = tweet.text;
	tweetText = tweetText.replace("@ineffablue94 ", "");
	// some kind of hashtag that doesn't trigger this
	// maybe edits?
	if ((tweetText.indexOf("#ineffable") > -1) || (tweetText.indexOf("RT") > -1) || (tweet.in_reply_to_status_id_str !== null))
	{
		console.log("not doing any db stuff");
	}

	else
	{
		Poet.find(
		{
			_id: tweet.user.id_str
		}, function(err, docs)
		{
			//console.log(docs);
			if (err) throw err;
			if (docs.length > 0)
			{
				console.log("user exists");
				//do things like adding the tweet content to "lines"
				Poet.findOneAndUpdate(
				{
					_id: tweet.user.id_str
				},
				{
					$push: {lines: tweet.id_str}
				}, function(err, docs)
				{
					if (err) throw err;

					Poem.find(function(err, docs)
					{
						if (err) throw err;

						var howManyRands = docs.length + 1;
						var rand = Math.floor(Math.random() * howManyRands);
						if (docs.length === 0 || rand === docs.length) //There are no poems, or new poem is rolled
						{

							var newPoem = new Poem(
							{
								_id: tweet.id_str,
								length: 10,
								lines: [tweet.id_str],
								latestDate: tweetDate
							})
							newPoem.save(function(err)
							{
								if (err) throw err;
								console.log("new poem created");

								var newLine = new Line(
								{
									_id: tweet.id_str,
									text: tweetText,
									poet: tweet.user.screen_name,
									poem: tweet.id_str,
									date: tweetDate
								})
								newLine.save(function(err)
								{
									if (err) throw err;
								})
							})
						}
						else
						{
							if (docs[rand].length === docs[rand].lines.length) //poem's max length has been reached
							{
								var newPoem = new Poem(
								{
									_id: tweet.id_str,
									length: 10,
									lines: [tweet.id_str],
									latestDate: tweetDate
								})
								newPoem.save(function(err)
								{
									if (err) throw err;
									console.log("new poem created because maximum lines reached");

									var newLine = new Line(
									{
										_id: tweet.id_str,
										text: tweetText,
										poet: tweet.user.screen_name,
										poem: tweet.id_str,
										date: tweetDate
									})
									newLine.save(function(err)
									{
										if (err) throw err;
									})
								})
							}
							else
							{
								Poem.findOneAndUpdate(
								{
									_id: docs[rand]._id
								}, 
								{
									$push: {lines: tweet.id_str},
									latestDate: tweetDate
								}, function(err, docs)
								{
									if (err) throw err;
									console.log("added a line to existing poem");
									
									var newLine = new Line(
									{
										_id: tweet.id_str,
										text: tweetText,
										poet: tweet.user.screen_name,
										poem: docs._id,
										date: tweetDate
									})
									newLine.save(function(err)
									{
										if (err) throw err;
									})

								})
							}
						}

					})

					
				})

			}
			//maybe new user always starts a new poem
			else
			{
				console.log("new poet");
				var newPoet = new Poet(
				{
					name: tweet.user.name,
					id: tweet.user.id,
					_id: tweet.user.id_str,
					screen_name: tweet.user.screen_name,
					lines: tweet.id_str
				});
				newPoet.save(function(err)
				{
					if (err) throw err;

					Poem.find(function(err, docs)
					{
						if (err) throw err;

						var howManyRands = docs.length + 1;
						var rand = Math.floor(Math.random() * howManyRands);
						if (docs.length === 0 || rand === docs.length) //There are no poems, or new poem is rolled
						{

							var newPoem = new Poem(
							{
								_id: tweet.id_str,
								length: 10,
								lines: [tweet.id_str]
							})
							newPoem.save(function(err)
							{
								if (err) throw err;
								console.log("new poem created");

								var newLine = new Line(
								{
									_id: tweet.id_str,
									text: tweetText,
									poet: tweet.user.screen_name,
									poem: tweet.id_str
								})
								newLine.save(function(err)
								{
									if (err) throw err;
								})
							})
						}
						else
						{
							if (docs[rand].length === docs[rand].lines.length) //poem's max length has been reached
							{
								var newPoem = new Poem(
								{
									_id: tweet.id_str,
									length: 10,
									lines: [tweet.id_str]
								})
								newPoem.save(function(err)
								{
									if (err) throw err;
									console.log("new poem created because maximum lines reached");

									var newLine = new Line(
									{
										_id: tweet.id_str,
										text: tweetText,
										poet: tweet.user.screen_name,
										poem: tweet.id_str
									})
									newLine.save(function(err)
									{
										if (err) throw err;
									})
								})
							}
							else
							{
								Poem.findOneAndUpdate(
								{
									_id: docs[rand]._id
								}, 
								{
									$push: {lines: tweet.id_str}
								}, function(err, docs)
								{
									if (err) throw err;
									console.log("added a line to existing poem");
									
									var newLine = new Line(
									{
										_id: tweet.id_str,
										text: tweetText,
										poet: tweet.user.screen_name,
										poem: docs._id
									})
									newLine.save(function(err)
									{
										if (err) throw err;
									})

								})
							}
						}

					})



				})
			}
		
		});
	}

});

stream.on("delete", function(data)
{
	console.log(data);
})

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


router.param("screenname", function(req, res, next, sname)
{
	var query = Poet.findOne({"screen_name" : sname});

	query.select("name _id screen_name lines");

	query.exec(function(err, poet)
	{
		if (err) return next(err);
		if (!poet) return next(new Error("rip"));
		//console.log(poet);
		//req.name = pname;
		req.poet = poet;
		return next();
	});
})


router.get("/restful/poets/:screenname", function(req, res)
{
	
	//if id doesn't exist it's still ok
	req.poet.populate("lines", function(err, docs)
	{
		res.json(req.poet);
	})

	
})


router.get("/restful/firstlines", function(req, res, next)
{
	FirstLine.find({}).populate("lines").exec(function(err, docs)
	{
		if (err) throw err;
		res.json(docs);
	})
})

router.get("/restful/poems", function(req, res, next)
{
	Poem.find({}).populate("lines").exec(function(err, docs)
	{
		if (err) throw err;
		res.json(docs);
	})
})

router.param("poem", function(req, res, next, poemID)
{
	console.log(poemID);
	var query = Poem.findById(poemID);

	query.select("_id title lines tags");

	query.exec(function(err, poem)
	{
		if (err) return next(err);
		if(!poem) return next(new Error("rip"));
		req.poem = poem;
		return next();
	})
})

router.get("/restful/poems/:poem", function(req, res, next)
{
	req.poem.populate("lines", function(err, docs)
	{
		res.json(req.poem);
	})
})

module.exports = router;
