var mongoose = require("mongoose");

var PoetSchema = new mongoose.Schema(
{
	id: Number,
	_id: String,
	name: String,
	screen_name: String,
	lines: [{type: mongoose.Schema.Types.String, ref: "Line"}]
});

mongoose.model("Poet", PoetSchema);