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

var pronouns = ["I", "me", "we", "us", "you", "she", "her", "he", "him", "it", "they", "them", "my", "your", "his", "hers", "its", "our", "their", "mine", "yours", "ours", "theirs"];

var conjunctionsAndOther = ["for", "and", "nor", "but", "or", "yet", "so", "therefore", "thus"]; //possible add similar ie however etc



function createNewPoem(tweet, callback)
{
	var howManyLines = 10 + Math.floor(Math.random() * 16);
	var tweetDate = dateParse(new Date());
	var newPoem = new Poem(
	{
		_id: tweet.id_str,
		length: howManyLines,
		lines: [tweet.id_str],
		latestDate: tweetDate
	})
	newPoem.save(callback);
}

function createNewLineWithNewPoem(tweet, callback)
{
	var tweetDate = dateParse(new Date());
	var tweetText = tweet.text;
	if (tweetText.indexOf(".@ineffablue94") > -1)
	{
		tweetText = tweetText.replace(".@ineffablue94", "");
	}
	else
	{
		tweetText = tweetText.replace("@ineffablue94 ", "");
	}
	

	var newLine = new Line(
	{
		_id: tweet.id_str,
		text: tweetText,
		poet: tweet.user.screen_name,
		poetID: tweet.user.id_str,
		poem: tweet.id_str,
		date: tweetDate
	})
	newLine.save(callback);
}

function ArrRelatedToI(arr)
{
	//console.log(arr.indexOf("I") + " " + arr.indexOf("I\'ll") + " " + arr.indexOf("I\'m") + " " + arr.indexOf("I\'d"));
	return arr.indexOf("I") > -1 || arr.indexOf("I\'ll") > -1 || arr.indexOf("I\'m") > -1 || arr.indexOf("I\'d") > -1 || arr.indexOf("I\'ve") > -1;
}

//low chance of we and their being next to each other

function ArrRelatedToPlural(arr, base) //can use we with this
{
	return arr.indexOf(base) > -1 || arr.indexOf(base + "\'ll") > -1 || arr.indexOf(base + "\'d") > -1 || arr.indexOf(base + "\'ve") > -1 || arr.indexOf(base + "\'re") > -1;
}

var stream = T.stream("statuses/filter", {track: "@ineffablue94"});
stream.on("tweet", function(tweet)
{
	//console.log(tweet); //maybe different check for rt
	console.log("got tweet");

	var howManyLines = 10 + Math.floor(Math.random() * 16);

	var tweetDate = dateParse(new Date());
	

	var tweetText = tweet.text;
	if (tweetText.indexOf(".@ineffablue94") > -1)
	{
		tweetText = tweetText.replace(".@ineffablue94", "");
	}
	else
	{
		tweetText = tweetText.replace("@ineffablue94 ", "");
	}
	var arrTweetText = tweetText.split(" ");
	console.log(arrTweetText);
	// some kind of hashtag that doesn't trigger this
	// maybe edits?
	//maybe determine title through some voting system
	if ((tweetText.indexOf("#ineffable") > -1) || (tweetText.indexOf("RT") > -1) || (tweet.in_reply_to_status_id_str !== null))
	{
		console.log("not doing any db stuff");
	}


	//add if only one line in the poem
	else if (arrTweetText[0] === "delete")
	{
		console.log("deleting...");
		Line.findOne(
		{
			_id: arrTweetText[1]
		}, function(err, docs)
		{
			if (err) throw err;
			if (tweet.user.screen_name === docs.poet || tweet.user.screen_name === "aGoLemonade")
			{
				console.log("allowed to delete");
				var poem_id = docs.poem;
				console.log("poem id is " + poem_id);
				docs.remove();

				Poem.update({_id: poem_id}, {$pullAll: {_id: arrTweetText[1]}});
				
			}
		})
	}

	else
	{




		// if (tweet.user.id_str === "2802785400")
		// {
		// 	console.log("creator tweeted");
		// 	if (arrTweetText[1] === "delete")
		// 	{
		// 		console.log("deleting...");

		// 	}
		// }

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











						//create a different organizational scheme so multiple factors can be considered
						//actually potentially fine

						//if the first word isn't a conjunction, higher chance of new poem
						if (conjunctionsAndOther.indexOf(arrTweetText[0]) === -1)
						{
							howManyRands = Math.floor(howManyRands + 2);
							console.log("first word isn't a conjunction or other");
						}

						//depending on the roll of rand, we create a new poem or update and existing one
						var rand = Math.floor(Math.random() * howManyRands);
						console.log("rolled rand: " + rand);
						if (docs.length === 0 || rand >= docs.length) //There are no poems, or new poem is rolled
						{

							createNewPoem(tweet, function(err)
							{
								if (err) throw err;
								console.log("new poem created with createNewPoem");

								createNewLineWithNewPoem(tweet, function(err)
								{
									if (err) throw err;
									console.log("new line created with function")
								})
							})
						}
						else
						{
							if (docs[rand].length <= docs[rand].lines.length) //poem's max length has been reached
							{
								createNewPoem(tweet, function(err)
								{
									if (err) throw err;
									console.log("new poem created because maximum lines reached, using createNewPoem");

									createNewLineWithNewPoem(tweet, function(err)
									{
										if (err) throw err;
										console.log("new line created with function")
									})
								})
							}
							else
							{
								//if the tweet contains "we"

								//let theirs be more ok if the line contains ours
								if (ArrRelatedToPlural(arrTweetText, "we"))
								{
									console.log("Line contained a variant of we");
									var potentialPoems = [];
									var useThesePoems = [];

									Poem.find({}).populate("lines").exec(function(err, docs)
									{
										for (var i = 0; i < docs.length; i++)
										{
											var lineOfInterest = docs[i].lines[docs[i].lines.length-1].text.split(" ");
											if ((ArrRelatedToPlural(lineOfInterest, "they") || lineOfInterest.indexOf("their") > -1 || lineOfInterest.indexOf("theirs") > -1) && (lineOfInterest.indexOf("ours") === -1 || lineOfInterest.indexOf("our") === -1))
											{
												console.log("the last line of the potential poem contains their or theirs but does not contain our or ours");
												console.log(lineOfInterest);
												potentialPoems.push(docs[i]);
											}
											else
											{
												console.log("we want these lines to be more likely")
												useThesePoems.push(docs[i]);
											}
										}

										var chanceOfSelecting = Math.floor(Math.random() * 6);
										var randInPP = Math.floor(Math.random() * potentialPoems.length);
										//var poemID = potentialPoems[randInPP]._id;
										var highChanceRand = Math.floor(Math.random() * useThesePoems.length);
										//var goodPoemID = useThesePoems[highChanceRand]._id;
										//console.log(goodPoemID);




										//high chance of not putting it in here
										if ((0 <= chanceOfSelecting && chanceOfSelecting <= 4) && useThesePoems.length > 0)
										{
											console.log("the good rng");
											Poem.findOneAndUpdate(
											{
												_id: useThesePoems[highChanceRand]._id
											},
											{
												$push: {lines: tweet.id_str},
												latestDate: tweetDate
											}, function(err, docs)
											{
												if (err) throw err;
												var newLine = new Line(
												{
													_id: tweet.id_str,
													text: tweetText,
													poet: tweet.user.screen_name,
													poetID: tweet.user.id_str,
													poem: useThesePoems[highChanceRand]._id,
													date: tweetDate
												})
												newLine.save(function(err)
												{
													if (err) throw err;
												})
											})
										}
										else if (potentialPoems.length > 0)
										{
											console.log("the bad rng");
											Poem.findOneAndUpdate(
											{
												_id: potentialPoems[randInPP]._id
											},
											{
												$push: {lines: tweet.id_str},
												latestDate: tweetDate
											}, function(err, docs)
											{
												if (err) throw err;
												var newLine = new Line(
												{
													_id: tweet.id_str,
													text: tweetText,
													poet: tweet.user.screen_name,
													poetID: tweet.user.id_str,
													poem: potentialPoems[randInPP]._id,
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
													poetID: tweet.user.id_str,
													poem: docs._id,
													date: tweetDate
												})
												newLine.save(function(err)
												{
													if (err) throw err;
												})

											})
										}
									})
								}

								else if ((ArrRelatedToPlural(arrTweetText, "they") || arrTweetText.indexOf("their") > -1 || arrTweetText.indexOf("theirs") > -1) && (arrTweetText.indexOf("ours") === -1 || arrTweetText.indexOf("our") === -1))
								{
									console.log("Line contained a variant of they but not our or ours");
									var potentialPoems = [];
									var useThesePoems = [];

									Poem.find({}).populate("lines").exec(function(err, docs)
									{
										for (var i = 0; i < docs.length; i++)
										{
											var lineOfInterest = docs[i].lines[docs[i].lines.length-1].text.split(" ");
											if (ArrRelatedToPlural(arrTweetText, "we"))
											{
												console.log("the last line of the potential poem contains we");
												console.log(lineOfInterest);
												potentialPoems.push(docs[i]);
											}
											else
											{
												console.log("we want these lines to be more likely")
												useThesePoems.push(docs[i]);
											}
										}

										var chanceOfSelecting = Math.floor(Math.random() * 6);
										var randInPP = Math.floor(Math.random() * potentialPoems.length);
										

										//var poemID = potentialPoems[randInPP]._id;
										var highChanceRand = Math.floor(Math.random() * useThesePoems.length);
										//var goodPoemID = useThesePoems[highChanceRand]._id;
										//console.log(goodPoemID);




										//high chance of putting here
										if ((0 <= chanceOfSelecting && chanceOfSelecting <= 4) && useThesePoems.length > 0)
										{
											console.log("the good rng");
											Poem.findOneAndUpdate(
											{
												_id: useThesePoems[highChanceRand]._id
											},
											{
												$push: {lines: tweet.id_str},
												latestDate: tweetDate
											}, function(err, docs)
											{
												if (err) throw err;
												var newLine = new Line(
												{
													_id: tweet.id_str,
													text: tweetText,
													poet: tweet.user.screen_name,
													poetID: tweet.user.id_str,
													poem: useThesePoems[highChanceRand]._id,
													date: tweetDate
												})
												newLine.save(function(err)
												{
													if (err) throw err;
												})
											})
										}
										//make sure the arr actually has elements
										else if (potentialPoems.length > 0)
										{
											console.log("the bad rng");
											Poem.findOneAndUpdate(
											{
												_id: potentialPoems[randInPP]._id
											},
											{
												$push: {lines: tweet.id_str},
												latestDate: tweetDate
											}, function(err, docs)
											{
												if (err) throw err;
												var newLine = new Line(
												{
													_id: tweet.id_str,
													text: tweetText,
													poet: tweet.user.screen_name,
													poetID: tweet.user.id_str,
													poem: potentialPoems[randInPP]._id,
													date: tweetDate
												})
												newLine.save(function(err)
												{
													if (err) throw err;
												})
											})
										}
										//catch all
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
													poetID: tweet.user.id_str,
													poem: docs._id,
													date: tweetDate
												})
												newLine.save(function(err)
												{
													if (err) throw err;
												})

											})
										}
									})
								}
								else if (ArrRelatedToI(arrTweetText))
								{
									console.log("The line contained I or I contraction");
									console.log("it was " + arrTweetText);
									var potentialPoems = [];
									Poem.find({}).populate("lines").exec(function(err, docs)
									{
										for (var i = 0; i < docs.length; i++)
										{
											//console.log(docs[i].lines);
											var lineOfInterest = docs[i].lines[docs[i].lines.length-1].text.split(" ");
											if (ArrRelatedToI(lineOfInterest))
											{
												potentialPoems.push(docs[i]);
											}
										}
										//console.log(potentialPoems);
										

										var hOrT = Math.floor(Math.random() * 3);
										var randInPP = Math.floor(Math.random() * potentialPoems.length)
										// var poemID = potentialPoems[randInPP]._id;
										console.log(hOrT);
										if ((0 <= hOrT && hOrT <= 1) && potentialPoems.length > 0)
										{
											Poem.findOneAndUpdate(
											{
												_id: potentialPoems[randInPP]._id
											},
											{
												$push: {lines: tweet.id_str},
												latestDate: tweetDate
											}, function(err, docs)
											{
												if (err) throw err;
												console.log("added to a line with I");
												//console.log(poemID);

												var newLine = new Line(
												{
													_id: tweet.id_str,
													text: tweetText,
													poet: tweet.user.screen_name,
													poetID: tweet.user.id_str,
													poem: potentialPoems[randInPP]._id,
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
												console.log("added a line to a random poem first appearance");
												
												var newLine = new Line(
												{
													_id: tweet.id_str,
													text: tweetText,
													poet: tweet.user.screen_name,
													poetID: tweet.user.id_str,
													poem: docs._id,
													date: tweetDate
												})
												newLine.save(function(err)
												{
													if (err) throw err;
												})

											})
										}

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
											poetID: tweet.user.id_str,
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
					lines: [tweet.id_str]
				});
				newPoet.save(function(err)
				{
					if (err) throw err;

					Poem.find({}, function(err, docs)
					{
						if (err) throw err;

						var howManyRands = docs.length;
						var rand = Math.floor(Math.random() * howManyRands);

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
								console.log("new user always adds a new line to existing");
								
								var newLine = new Line(
								{
									_id: tweet.id_str,
									text: tweetText,
									poet: tweet.user.screen_name,
									poetID: tweet.user.id_str,
									date: tweetDate,
									poem: docs._id
								});
								newLine.save(function(err)
								{
									if (err) throw err;
								});

							})
					})
							
				})		
			}
		})
	}
})

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
		//console.log(docs);
		res.send(docs);
	})
})


// router.param("screenname", function(req, res, next, sname)
// {
// 	var query = Poet.findOne({"screen_name" : sname});

// 	query.select("name _id screen_name lines");

// 	query.exec(function(err, poet)
// 	{
// 		if (err) return next(err);
// 		if (!poet) return next(new Error("rip"));
// 		//console.log(poet);
// 		//req.name = pname;
// 		req.poet = poet;
// 		return next();
// 	});
// })

router.param("userid", function(req, res, next, uid)
{
	var query = Poet.findOne({"_id" : uid});

	query.select("name _id screen_name lines");

	query.exec(function(err, poet)
	{
		if (err) return next(err);
		if (!poet) return next(new Error("uid not working o.o"));
		//console.log(poet);
		//req.name = pname;
		req.poet = poet;
		return next();
	});
})


// router.get("/restful/poets/:screenname", function(req, res)
// {
	
// 	//if id doesn't exist it's still ok
// 	req.poet.populate("lines", function(err, docs)
// 	{
// 		res.json(req.poet);
// 	})

	
// })

router.get("/restful/poets/:userid", function(req, res)
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
		console.log("test");
		res.json(docs);
	})
})

router.get("/restful/lines", function(req, res, next)
{
	Line.find({}, function(err, docs)
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
