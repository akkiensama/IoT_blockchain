var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var activitySchema = new Schema({
    time: Date,
    activity: String
});
module.exports = mongoose.model('activity', activitySchema);