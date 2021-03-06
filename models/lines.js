var mongoose = require("mongoose");

var LineSchema = new mongoose.Schema(
{
	_id: String,
	poet: {type: mongoose.Schema.Types.String, ref: "Poet"},
	poetID: {type: mongoose.Schema.Types.String, ref: "Poet"},
	text: String,
	poem: {type: mongoose.Schema.Types.String, ref: "Poem"},
	tags: [String],
	date: String
})

mongoose.model("Line", LineSchema);