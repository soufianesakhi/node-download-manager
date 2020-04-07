import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as mongoose from 'mongoose';
import * as path from 'path';
import 'source-map-support/register';
import { ApiRegistry } from './api/registry';
import { DownloadManager } from './service/download';
import { DownloadLinksWebSocketManager } from './service/websocket';
import { registerSPI } from './spi';
import { notify } from './util/utils';

global["fetch"] = require("node-fetch");

let dbUrl: string;
let downloadDirectory: string;
[
    dbUrl = 'mongodb://localhost:27017/users',
    downloadDirectory = 'S:/Downloads'
] = process.argv.slice(2);
console.log("DB url:", dbUrl);
console.log("Download directory:", downloadDirectory);

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, '../dist')));

// Database
let maxRetryMongo = 3;
let secToWait = 1;
const secToWaitIncr = 2;
function tryConnectMongo() {
    mongoose.connect(dbUrl).catch(reason => {
        if (maxRetryMongo-- === 0) {
            console.error(reason);
            process.exit(-1);
        }
        console.error(`Mongo db connection failed. Retrying after ${secToWait}s ...`);
        setTimeout(tryConnectMongo, secToWait * 1000);
        secToWait += secToWaitIncr;
    });
}
tryConnectMongo();

// Set our api routes
const apiRegistry = new ApiRegistry(app);

// Register spi (user defined modules)
registerSPI(app);

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
const webSocketManager = new DownloadLinksWebSocketManager(server);
apiRegistry.setWebSocketManager(webSocketManager);

export const downloadManager = new DownloadManager(webSocketManager, downloadDirectory);
