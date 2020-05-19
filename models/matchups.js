const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MatchupSchema = new Schema({
  id: Number,
  creator: Number,
  name: String,

});

module.exports = mongoose.model('Matchup', MatchupSchema);
