var mongoose = require("mongoose");

var LineSchema = new mongoose.Schema(
{
	_id: String,
	poet: {type: mongoose.Schema.Types.String, ref: "Poet"},
	text: String,
	opening: {type: mongoose.Schema.Types.String, ref: "FirstLine"}
})

mongoose.model("Line", LineSchema);