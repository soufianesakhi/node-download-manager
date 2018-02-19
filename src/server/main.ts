import * as http from 'http';
import * as path from 'path';
import 'source-map-support/register';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import { ApiRegistry } from './api/registry';
import { notify } from './util/utils';

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, '../dist')));

// Database
mongoose.connect('mongodb://localhost:27017/users');

// Set our api routes
ApiRegistry.init(app);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

process.on('uncaughtException', (err: Error) => {
    notify("Uncaught Error", err.message, () => {
        console.error(err);
    });
});

const port = process.env.PORT || '3000';
app.set('port', port);

http.createServer(app).listen(port, () => console.log(`Running on localhost:${port}`));
