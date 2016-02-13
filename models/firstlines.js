var mongoose = require("mongoose");

var FirstLineSchema = new mongoose.Schema(
{
	id: Number,
	id_str: String,
	poet: String,
	text: String,
	length: Number,
	lines:[{type: mongoose.Schema.Types.String, ref: "Line"}]

});

mongoose.model("FirstLine", FirstLineSchema);