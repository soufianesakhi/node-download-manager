import * as http from 'http';
import * as path from 'path';
import 'source-map-support/register';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import { ApiRegistry } from './api/registry';
import { notify } from './util/utils';
import { WebSocketManager } from './websocket';
import { registerSPI } from './spi';

let dbUrl: string, downloadPath: string;
[
    dbUrl = 'mongodb://localhost:27017/users',
    downloadPath = 'S:/Downloads'
] = process.argv.slice(2);
console.log("dbUrl: " + dbUrl);
console.log("downloadPath: " + downloadPath);

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, '../dist')));

// Database
let maxRetryMongo = 3;
function tryConnectMongo() {
    mongoose.connect(dbUrl).catch(reason => {
        if (maxRetryMongo-- === 0) {
            console.error(reason);
            process.exit(-1);
        }
        console.error(reason + ", retrying after 1s ...");
        setTimeout(tryConnectMongo, 1000);
    });
}
tryConnectMongo();

// Set our api routes
const apiRegistry = new ApiRegistry(app);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

process.on('uncaughtException', (err: Error) => {
    notify("Uncaught Error", err.message, () => {
        console.error(err);
    });
});

process.on('SIGINT', () => {
    console.log("Server shut down");
    process.exit(0);
});

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));
const webSocketManager = new WebSocketManager(server);
apiRegistry.setWebSocketManager(webSocketManager);

registerSPI(app);
