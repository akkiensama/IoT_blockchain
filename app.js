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
var Sensor = require('./models/sensors');
var Activity = require('./models/activities');

mongoose.connect('mongodb://kien:kien1234@ds129394.mlab.com:29394/kiendata',  { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected ...'))
  .catch((err) => console.log('Fail to connect to mongodb'));
 
//var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var aboutRouter =  require('./routes/about');
var contactRouter = require('./routes/contact');

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

app.post('/reset', function(req, res, next){
  dataArr = [];
  io.sockets.emit('serverSendData', dataArr);
  res.location('/');
  res.redirect('/');
});

app.post('/postActivity', function(req, res, next){
  var data = {
    time: parseInt(req.query.time),
    temp: parseInt(req.query.temp),
    humid: parseInt(req.query.humid)
  }
  console.log(data);
  
});

app.get('/sensor', function(req, res, next) {

  var date = new Date();

  if (req.query.temp && req.query.humid && !isNaN(parseInt(req.query.temp)) && !isNaN(parseInt(req.query.humid))){

    ///insert to database
    var newSensorData = new Sensor({
      time: date.toLocaleString(), 
      temperature: parseInt(req.query.temp), 
      humidity: parseInt(req.query.humid)
    });

    newSensorData.save(function (err, newSensorData) {
      if (err){
        return console.error(err);
      } else{
        console.log('Activity Submitted To Server', newSensorData);
      }
    });

    ///Send Email Warning

    // var transporter = nodemailer.createTransport({
    //   service: 'Gmail',
    //   auth: {
    //     user: '...',
    //     pass: '...'
    //   }
    // });
    // var mailOptions = {
    //   from: '<...>',
    //   to: '1511640@hcmut.edu.vn',
    //   subject: 'Warning about temperature ',
    //   text: '',
    //   html: ''
    // };

    // if(data.temp > 40){
    //   mailOptions.text = 'Temperature was too high: ' + data.temp;
    //   mailOptions.html = '<p>Temperature was too high: ' + data.temp + ' &#8451;</p>';

    //   transporter.sendMail(mailOptions, function(error, info){
    //     if(error){
    //       console.log(error);
    //     }else{
    //       console.log('Mail message send: '+ info.response);
    //     }
    //   });
    // }
    // if(data.temp < 20){
    //   mailOptions.text = 'Temperature was too low: ' + data.temp;
    //   mailOptions.html = '<p>Temperature was too low: ' + data.temp + ' &#8451;</p>';

    //   transporter.sendMail(mailOptions, function(error, info){
    //     if(error){
    //       console.log(error);
    //     }else{
    //       console.log('Mail message send: '+ info.response);
    //     }
    //   });
    // }

  }else{
    console.log('Some data is missed!');
  }
      
  res.render('index'); 
});

app.get('/activity', function(req, res, next) {
  
  var date = new Date();
  var activity = '';

  if (req.query.activity){
    switch(req.query.activity){
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
      time: date.toLocaleString(),
      activity: activity
    });

    newActivity.save(function (err, newActivity) {
      if (err){
        return console.error(err);
      } else{
        console.log('Activity Submitted To Server', newActivity);
      }
    });

  }else{
    console.log('Some activity is missed!');
  }
  
  res.render('index');
});

// API FOR REQUESTING DATA
app.get('/api/activity', function(req, res, next) {
  Activity.find({ time: {$gte: req.query.from, $lte: req.query.to} }).select('-_id -__v')
    .then((result) => {
      res.json(result);
    })
    .catch((err) => console.log('api: fail to find activities data'))
})

app.get('/api/sensor', function(req, res, next) {
  Sensor.find({ time: {$gte: req.query.from, $lte: req.query.to} }).select('-_id -__v')
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

  //send sensors data to all client
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
