var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var activitySchema = new Schema({
    time: String,
    activity: String
});
module.exports = mongoose.model('activity', activitySchema);