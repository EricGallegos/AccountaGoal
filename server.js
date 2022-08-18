const path          = require('path');
const express       = require('express');
const mongoose      = require('mongoose');
const dotenv        = require('dotenv');
const exphbs        = require('express-handlebars');      // view engine
const methodOverride =require('method-override')          //
const passport      = require('passport');                // auth
const session       = require('express-session');         //
const MongoStore    = require('connect-mongo');
const connectDB     = require('./config/db');
const favicon       = require('serve-favicon');

// Load Config
dotenv.config({ path: './config/config.env'})

// Passport config
require('./config/passport')(passport);

connectDB();
const app = express();

// Body Parser
app.use(express.urlencoded( {extended: false} ))

// Method Override
app.use(methodOverride(function(req, res) {
  if(req.body && typeof req.body === 'object' && '_method' in req.body){
    // look in urlencoded POST bodies and delete it
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}))

app.use(favicon(__dirname + '/favicon.ico'));

// Logging
if(process.env.NODE_ENV === 'development'){
  const morgan = require('morgan');                  //Log handling
  app.use(morgan('dev'));
}

// Handlebars Helpers
const { formatDate, stripTags, truncate, editIcon, select, checkStatus, getToday } = require('./helpers/hbs')

// Handlebars
app.engine('.hbs', exphbs.engine({
  helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
    checkStatus,
    getToday,
  },
  defaultLayout: 'main',
  extname: '.hbs',
}));
app.set('view engine', '.hbs');

// Sessions
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    mongoUrl: process.env.MONGO_URI,
   }),
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global var
app.use(function(req, res, next) {
  res.locals.user = req.user || null;
  next();
})

//Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/goals', require('./routes/goals'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`))
