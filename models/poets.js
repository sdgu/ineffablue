var mongoose = require("mongoose");

var PoetSchema = new mongoose.Schema(
{
	id: Number,
	id_str: String,
	name: String,
	screen_name: String,
	lines: [{type: mongoose.Schema.Types.ObjectId, ref: "Line"}]
});

mongoose.model("Poet", PoetSchema);