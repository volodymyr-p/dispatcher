'use strict';
const debug = require('debug');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const serveStatic = require('serve-static');

const config = require('./config.json');
global.gConfig = (config);

const locale = require('./code/locale');
const auth = require('./code/authentication');

global.L = (locale.L);
global.locales = locale.locales;
global.getlocale = locale.getlocale;

const index = require('./routes/index');
const location = require('./routes/location');
const logreg = require('./routes/loginregister');
const map = require('./routes/map');
const malfunctions = require('./routes/malfunctions');
const varieties = require('./routes/statment_varieties');
const organizations = require('./routes/organizations');
const reg_admin = require('./routes/reg_admin');
const statements = require('./routes/statements_journal');
const analyticsPage = require('./routes/analyticsPage');
const statisticsVarieties = require('./routes/statistics_varieties');
const amountStatementsStatistics = require('./routes/amountStatementsStatistics');
const files = require('./routes/files');
const vehicles = require('./routes/vehicles');
const teams = require('./routes/teams');
const perfomer_api = require('./routes/perfomer_api');
const workingTime = require('./routes/workingTime');
const workingHoursStatistics = require('./routes/workingHoursStatistics');
const workingHoursStatisticsCalendar = require('./routes/workingHoursStatisticsCalendar');
const teamsStatistics = require('./routes/teamsStatistics');
const counters = require('./routes/counters');
//const firebase = require('./routes/firebase');

const app = express();
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//create socket
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "pug");

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.use(function (req, res, next) { //Interception unlogged users
    if (req.url.includes('uploads')) {
        auth.check({
            req: req,
            res: res,
            roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
        }, (user) => {
                app.use('/uploads', serveStatic(__dirname + '/public/uploads'));
        });
    }
    next();
});
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', index);
app.use('/location', location);
app.use('/logreg', logreg);
app.use('/malfunctions', malfunctions);
app.use('/map', map);
app.use('/varieties', varieties);
app.use('/organizations', organizations);
app.use('/registration-admin', reg_admin);
app.use('/statements', statements);
app.use('/statistics', analyticsPage);
app.use('/statistics-variety', statisticsVarieties);
app.use('/amount-statements', amountStatementsStatistics);
app.use('/files', files);
app.use('/vehicles', vehicles);
app.use('/teams', teams);
app.use('/api/perfomer', perfomer_api);
app.use('/working-time', workingTime);
app.use('/working-statistics', workingHoursStatistics);
app.use('/working-statistics-calendar', workingHoursStatisticsCalendar);
app.use('/teams-statistics', teamsStatistics);
app.use('/counters', counters);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

const db = require('./code/database');
process.on('uncaughtException', function(err) {
    if (err.code == "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
        db.con = mysql.createConnection(global.gConfig.sqlConfig);
    }
    console.log('Caught exception: ', err);
});

//not best but.. (мне звонят и говорят что оно не пашет. надоели уже и оно надоело)
setInterval(function () {
    db.con.query('SELECT 1');
}, 5000);


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            statusCode: err.status,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        statusCode: err.status,
        error: {}
    });
});

// Handle socket operation.
// On any connection listen for events.
io.on('connection', function(socket) {

    socket.on('checking conection', function(data) {
        //statement.isAdded(mysql,pool,function(error,result){ //coming soon
        console.log('User ' + data.user + 'is connected');
        socket.emit("notify everyone", {
            user: data.user,
            id_organization: data.id_organization,
            comment: 'Added new statement \n(Добавлена новая заявка)'
        });
        socket.broadcast.emit("notify everyone", {
            user: data.user,
            id_organization: data.id_organization,
            comment: 'Added new statement \n(Добавлена новая заявка)'
        });
        //});
    });

});

app.set('port', config.appPort);

http.listen(app.get('port'), function() {
    debug('Express server listening on port ' + http.address().port);
});