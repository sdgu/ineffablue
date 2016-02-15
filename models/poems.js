var mongoose = require("mongoose");

var PoemSchema = new mongoose.Schema(
{
	_id: String,
	title: String,
	length: Number,
	lines: [{type: mongoose.Schema.Types.String, ref: "Line"}],
	tags: [String],
	latestDate: String,
	contributors: [{type: mongoose.Schema.Types.String, ref: "Poet"}]
});

mongoose.model("Poem", PoemSchema);