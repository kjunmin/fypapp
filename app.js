const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

//Import Middleware
const cors = require('cors');
const bodyparser = require('body-parser');

//Import Config files
const dbconfig = require('./config/database_config');


//Connect to database via config file
mongoose.connect(dbconfig.database);

//Log connection status (success/failure)
mongoose.connection.on('connected', () => {
    console.log('Connected to database '+ dbconfig.database);
});

mongoose.connection.on('error', (err) => {
    console.log('Database Error: ' + err);
});

const app = express();
const port = 3001;

//CORS Middleware
app.use(cors());

app.use(bodyparser.json());

//Set Static folder
app.use(express.static(path.join(__dirname, 'public')));
const routes = require('./routes/routes');

app.use('/users', routes);

app.get('/', (req, res)=> {
    res.send('Invalid Endpoint');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
    console.log('Server started on port: ' + port);
})