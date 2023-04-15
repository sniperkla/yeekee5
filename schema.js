const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const lotterySchema = new Schema({
  name: String,
  round: Number,
  date: String,
  upper3: String,
  below2: String,
});

module.exports = mongoose.model("yeekee5", lotterySchema, "yeekee5");
