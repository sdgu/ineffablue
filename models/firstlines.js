var mongoose = require("mongoose");

var FirstLineSchema = new mongoose.Schema(
{
	id: Number,
	_id: String,
	poet: {type: mongoose.Schema.Types.String, ref: "Poet"},
	text: String,
	maxLength: Number,
	lines:[{type: mongoose.Schema.Types.String, ref: "Line"}]

});

mongoose.model("FirstLine", FirstLineSchema); 