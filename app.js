var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var multer = require('multer');
var chalk = require('chalk');
var fs = require('fs');
var message_handler = require('./routes/message_handler');
// init app
var app = express();

/**var multerconfig = {
  dest: "./public/upload",
  limits: {
    fieldNameSize: 1024,
    files: 8,
    fields: 7
  },
  rename: function(fieldname, filename) {
    console.log("multerconfig : rename");
    console.log(fieldname + "  " + filename);
    return Date.now();
  },
  onFileUploadStart: function(file, req, res) {
    console.log("multerconfig : " + file.originalname + ' upload starting ...');
    if (file.mimetype !== 'image/jpg' &&
      file.mimetype !== 'image/jpeg' &&
      file.mimetype !== 'image/png') {
      console.log('multerconfig :  mimetype ' + file.mimetype + ' not supported');
      req.mfupload = false;
      return false;
    }
  },
  //@todo: remove local uploads image
  onFileUploadComplete: function(file, req, res) {
    console.log("multerconfig " + file.fieldname + ' uploaded to ' + file.path);
    req.mfupload = true;
  },
  onError: function(error, next) {
    console.log("multerconfig : onerror");
    console.log(error);
    //req.mfupload = false;
    next(error);
  },
  onFileSizeLimit: function(file) {
    console.log('multerconfig : onFileSizeLimit: ', file.originalname);
    //req.mfupload = false;
    fs.unlink('./' + file.path);
  },
  onFilesLimit: function() {
    console.log('multerconfig : Crossed file limit!');
    //req.mfupload = false;
  },
  onFieldsLimit: function() {
    console.log('multerconfig : Crossed fields limit!');
    //req.mfupload = false;
  },
  onPartsLimit: function() {
    console.log('multerconfig : Crossed parts limit!');
    //req.mfupload = false;
  },
}**/

var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/loginAppApi');
var chat = require('./routes/chat');

mongoose.connect("mongodb://localhost/loginapp", function(err) {
  if (err) {
    console.error(chalk.red('Could not connect to MongoDB!'));
    console.log(chalk.red(err));
  } else {
    console.log(chalk.green("connected to mongodb instance"));
  }
});
var db = mongoose.connection;
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function(req, file, cb) {
    console.log(file);
    var extension = file.originalname.split('.')[1];
    cb(null, Date.now() + '.' + extension); //Appending .jpg
  }
});

var upload = multer({
  storage: storage
});
app.use(multer(upload).single('uimg'));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
  defaultLayout: 'layout'
}));
app.set('view engine', 'handlebars');

//middlewares

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//express session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

//connect flash
app.use(flash());

//global vars
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/api', api);
app.use('/chat', chat);
var server = require("http").createServer(app),
  io = require("socket.io").listen(server);
server.listen(3000, function(err) {
  if (!err) {
    console.log("server started!!!!\n\n");
    console.log("-------------------");
  }
});
var users = [];
io.sockets.on('connection', function(socket) {
  console.log("new user connected");
  socket.on('join', function(data) {
    users.push({
      id: socket.id,
      username: data.username
    });
    console.log("new user joined\nusers ::: ", users);
  });
  socket.on('send message', function(data) {
    message_handler.save_new_message(data);
    console.log("got a message");
    var to, from;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username == data.receiver) {
        to = users[i].id;
      }
      if (users[i].username == data.sender) {
        from = users[i].id;
      }
    }
    console.log("to ::: " + to + "\nfrom   :::  " + from);
    socket.broadcast.to(to).emit('new message', data);
    console.log("sent meassage to this user");
    //socket.broadcast.emit('new message',data)
  });
  socket.on('get_all_messages', function(data) {
    console.log("socket request for getting all messages.\n parms:::",data)
    message_handler.get_all_messages(data.curr_user, data.receiver_user, function(success, messages) {
      if (success == true) {
        var curr_user_id;
        for (var i = 0; i < users.length; i++) {
          if (users[i].username == data.curr_user) {
            curr_user_id = users[i].id;
          }
        }
        console.log("socket id for "+ data.curr_user+"is:::     "+curr_user_id);
        socket.emit('show all messages',messages);
      } else {
        console.log("error in retreiving all messages");
      }
    });
  });
  socket.on('disconnect',function(){
      for(var i=0;i<users.length;i++){
        if(users[i].id==socket.id){
          users.splice(i,1); //Removing single user
        }
      }
      console.log("user disconnected"); //sending list of users
    });
})