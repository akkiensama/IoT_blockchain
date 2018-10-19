var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sensorSchema = new Schema({
    time: Date,
    temperature: Number,
    humidity: Number
});
module.exports = Sensor = mongoose.model('sensor', sensorSchema);