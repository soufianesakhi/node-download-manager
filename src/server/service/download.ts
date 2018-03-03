import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';
import * as progress from 'request-progress';
import { DownloadLinksModel } from '../..';
import { WebSocketManager } from './websocket';
import { DownloadProgress } from 'model';
import { notify } from '../util/utils';


export class DownloadManager {
    private downloadsLogFile: string;
    constructor(private webSocketManager: WebSocketManager, private downloadDirectory: string) {
        this.downloadsLogFile = path.join(downloadDirectory, "downloads.logs.txt");
    }

    download(directDownloadURI: string, extension: string, links: DownloadLinksModel, endCallback: Function) {
        let fileName = links.artist;
        fileName += (fileName ? " - " : "") + links.title + extension;
        const downloadFileDestination = path.join(this.downloadDirectory, fileName);
        this.appendLog("start", fileName);
        progress(request(directDownloadURI), {
            throttle: 1000, // Progress event interval (ms)
        }).on('progress', (state: RequestProgressState) => {
            const p: DownloadProgress = {
                percent: state.percent * 100,
                speed: state.speed / 1e6,
                remainingTime: state.time.remaining,
                remainingSize: (state.size.total - state.size.transferred) / 1e6
            };
            this.webSocketManager.sendMessage({
                channel: "progress",
                data: p
            });
        }).on('error', (err: Error) => {
            notify("Download error", fileName + "\n" + err.message);
            console.error(err);
            this.appendLog("error", fileName + " -  " + err);
        }).on('end', () => {
            const p: DownloadProgress = {
                percent: 100,
                speed: 0,
                remainingTime: 0,
                remainingSize: 0
            };
            this.webSocketManager.sendMessage({
                channel: "progress",
                data: p
            });
            endCallback();
            this.appendLog("end", fileName);
        }).pipe(fs.createWriteStream(downloadFileDestination));
    }

    private appendLog(category: string, txt: string) {
        const time = new Date().toLocaleTimeString();
        fs.appendFileSync(this.downloadsLogFile, `[${time}][${category}] ${txt}\n`);
    }
}

interface RequestProgressState {
    /** Overall percent (between 0 to 1) */
    percent: number;
    /** The download speed in bytes/sec */
    speed: number;
    size: {
        /** The total payload size in bytes */
        total: number,
        /** The transferred payload size in bytes */
        transferred: number
    };
    time: {
        /** The total elapsed seconds since the start (3 decimals) */
        elapsed: number,
        /** The remaining seconds to finish (3 decimals) **/
        remaining: number
    };
}