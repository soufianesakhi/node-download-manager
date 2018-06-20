import * as fs from 'fs';
import { DownloadProgress } from 'model';
import * as path from 'path';
import * as request from 'request';
import * as progress from 'request-progress';
import { notify } from '../util/utils';
import { WebSocketManager } from './websocket';


export class DownloadManager {
    private downloadsLogFile: string;
    constructor(private webSocketManager: WebSocketManager, private downloadDirectory: string) {
        this.downloadsLogFile = path.join(downloadDirectory, "downloads.logs.txt");
    }

    download(directDownloadURI: string, title: string, fileName: string, id: number, endCallback: (finalFilePath: string) => void) {
        const downloadFileDestination = path.join(this.downloadDirectory, fileName);
        const dlFileName = title + " (" + fileName + ")";
        this.appendLog("start", dlFileName);
        progress(request(directDownloadURI), {
            throttle: 100, // Progress event interval (ms)
        }).on('progress', (state: RequestProgressState) => {
            const p: DownloadProgress = {
                id: id,
                title: title,
                fileName: fileName,
                percent: this.format(state.percent * 100),
                speed: this.format(state.speed / 1e6),
                remainingTime: this.format(state.time.remaining),
                remainingSize: this.format((state.size.total - state.size.transferred) / 1e6)
            };
            this.webSocketManager.sendMessage({
                channel: "progress",
                data: p,
                id: id
            });
        }).on('error', (err: Error) => {
            notify("Download error", fileName + "\n" + err.message);
            console.error(err);
            this.appendLog("error", dlFileName + "\n" + err);
        }).on('end', () => {
            const p: DownloadProgress = {
                id: id,
                title: title,
                fileName: fileName,
                percent: 100,
                speed: 0,
                remainingTime: 0,
                remainingSize: 0
            };
            this.webSocketManager.sendMessage({
                channel: "progress",
                data: p,
                id: id
            });
            endCallback(downloadFileDestination);
            this.appendLog("end", dlFileName);
        }).pipe(fs.createWriteStream(downloadFileDestination));
    }

    format(n: number) {
        return +Number(n).toFixed(2);
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
