var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');

// my package
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');

var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

var web3 = require('web3');
var Container = require('./ethereum/container');

/*
* Set up mongoose and Collection
*/
var mongoose = require('mongoose');
var Sensor = require('./models/Sensor');
var Activity = require('./models/Activity');

mongoose.connect('mongodb://kien:kien1234@ds129394.mlab.com:29394/kiendata',  { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected ...'))
  .catch((err) => console.log('Fail to connect to mongodb'));
 
//var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var aboutRouter =  require('./routes/about');
var contactRouter = require('./routes/contact');

var activitiesAPI = require('./routes/api/activitiesAPI');
var sensorsAPI = require('./routes/api/sensorsAPI');

var app = express();

/*
 *add for socket
 * */
var server = require('http').createServer(app);
server.listen(process.env.PORT || 8888, function(){
  console.log('Server open on port 8888')
});
var io = require('socket.io').listen(server);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res, next){
  res.render('index',{title: 'Home'});
});

// for(let k = 0; k < 300; k++){
//   let te = Math.floor(Math.random()*8) + 27;
//   let hu = Math.floor(Math.random()*12) + 75;
//   let milis = Math.floor(Math.random()*120) + 1;
//   let ti = new Date(1542675540000 + milis*1000 + 30*60000*k);
//   var newSensorData = new Sensor({
//     time: ti, 
//     temperature: te, 
//     humidity: hu
//   });

//   newSensorData.save(function (err, newSensorData) {
//     if (err){
//       return console.error(err);
//     } else{
//       console.log('Activity Submitted To Server', newSensorData);
//     }
//   });
// }


// API FOR POST NEW DATA
app.post('/api/activity', function(req, res, next) {
  
  var activity = '';

  if (req.body.activity){
    switch(req.body.activity){
      case '11':
        activity = 'Bón phân hữu cơ';
        break;
      case '12':
        activity = 'Bón phân NPK';
        break;
      case '13': 
        activity = 'Bón phân HAI';
        break;
      case '14':
        activity = 'Bón phân khác';
        break;
      case '2':
        activity = 'Tưới nước';
        break;
      case '31':
        activity = 'Xịt thuốc Antracol';
        break;
      case '32':
        activity = 'Xịt thuốc Karate';
        break;
      case '33':
        activity = 'Xịt thuốc Cyrux';
        break;
      case '34':
        activity = 'Xịt thuốc khác';
        break;
      case '4':
        activity = 'Tỉa cành';
        break;
      case '5':
        activity = 'Bao trái';
        break;
      case '6':
        activity = 'Thu hoạch';
        break;
      default: 
        break;
    }

    var newActivity = new Activity({
      time: new Date(),
      activity: activity
    });

    newActivity.save(function (err, newActivity) {
      if (err) {
        return console.error(err);
      } else {
        console.log('Activity Submitted To Server', newActivity);
        res.send('Data upload successfully'+newActivity);
      }
    });

  } else {
    console.log('Some activity is missed!');
  }
  
});

app.post('/api/sensor', function(req, res, next) {

  if (req.body.temp && req.body.humid && !isNaN(parseInt(req.body.temp)) && !isNaN(parseInt(req.body.humid))){

    ///insert to database
    var newSensorData = new Sensor({
      time: new Date(), 
      temperature: parseInt(req.body.temp), 
      humidity: parseInt(req.body.humid)
    });

    newSensorData.save(function (err, newSensorData) {
      if (err){
        return console.error(err);
      } else{
        console.log('Activity Submitted To Server', newSensorData);
        res.send('Data upload successfully' + newSensorData);
      }
    }); 
        
  }
});
// API FOR REQUESTING DATA
app.get('/api/activity', function(req, res, next) {
  Activity.find({ time: {$gte: req.query.from, $lte: req.query.to} }).sort({time: -1}).select('-_id -__v')
    .then((result) => {
      res.json(result);
    })
    .catch((err) => console.log('api: fail to find activities data'))
})

app.get('/api/sensor', function(req, res, next) {
  Sensor.find({ time: {$gte: req.query.from, $lte: req.query.to} }).sort({time: -1}).select('-_id -__v')
    .then((result) => {
      res.json(result);
    })
    .catch((err) => console.log('api: fail to find sensors data'))
})

// SEND DATA TO CLIENT
io.sockets.on('connection', function(socket){
  console.log('co sensor ket noi');

  //send activities data to all client
  Activity.find({}).sort({time: -1}).limit(50).select('-_id -__v')
    .then((res) => {
      io.sockets.emit('server send activities data', res.reverse());
    })
    .catch((err) => console.log('Fail to find activities data'))

  Sensor.find({}).sort({time: -1}).limit(50).select('-_id -__v')
    .then((res) => {
      io.sockets.emit('server send sensors data', res.reverse());
    }) 
    .catch((err) => console.log('Fail to find sensors data'))

  
  socket.on('upload activities', function () {
    console.log('client request upload activites')
    Activity.find({}).sort({time: -1}).limit(50).select('-_id -__v')
    .then((res) => {

      let buffer = Buffer.from(JSON.stringify(res.reverse()));

      ipfs.add(buffer, (err, ipfsHash) => {
        if(err){
            console.log('Fail to upload activities to IPFS\n', err);
        } else {
          io.sockets.emit('IPFS activities hash', ipfsHash[0].hash);
        }
      });
    })
    .catch((err) => console.log('Fail to find activities data'));
  });

});


//app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/about', aboutRouter);
app.use('/contact', contactRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
