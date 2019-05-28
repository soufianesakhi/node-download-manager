import * as fs from 'fs';
import { DownloadProgress, DownloadState } from 'model';
import * as path from 'path';
import * as request from 'request';
import * as progress from 'request-progress';
import { notify } from '../util/utils';
import { DownloadActionListener, DownloadLinksWebSocketManager } from './websocket';


export class DownloadManager implements DownloadActionListener {
    private downloadsLogFile: string;
    requestById: { [id: number]: request.Request } = {};
    downloadNameById: { [id: number]: string } = {};
    stateById: { [id: number]: DownloadState } = {};
    constructor(private webSocketManager: DownloadLinksWebSocketManager, private downloadDirectory: string) {
        this.downloadsLogFile = path.join(downloadDirectory, "downloads.logs.txt");
        this.webSocketManager.registerDownloadActionListener(this);
    }

    download(directDownloadURI: string, title: string, fileName: string, id: number, successCallback: (finalFilePath: string) => void) {
        const downloadFileDestination = path.join(this.downloadDirectory, fileName);
        const downloadName = title + " ;; " + fileName + " ;; " + id;
        this.appendLog("start", downloadName);
        const req = request(directDownloadURI);
        this.requestById[id] = req;
        this.downloadNameById[id] = downloadName;
        let error = false;
        progress(req, {
            throttle: 1000, // Progress event interval (ms)
        }).on('progress', (state: RequestProgressState) => {
            const p: DownloadProgress = {
                id: id,
                title: title,
                fileName: fileName,
                percent: this.format(state.percent * 100),
                speed: this.format(state.speed / 1e6),
                remainingTime: this.format(state.time.remaining),
                remainingSize: this.format((state.size.total - state.size.transferred) / 1e6),
                state: this.stateById[id]
            };
            this.webSocketManager.sendMessage({
                channel: "progress",
                data: p,
                id: id
            });
        }).on('error', (err: Error) => {
            error = true;
            notify("Download error", fileName + "\n" + err.message);
            console.error(err);
            this.appendLog("error", downloadName + "\n" + err);
            this.cleanRequest(id);
        }).on('end', () => {
            const state = this.stateById[id];
            const p: DownloadProgress = {
                id: id,
                title: title,
                fileName: fileName,
                percent: 100,
                speed: 0,
                remainingTime: 0,
                remainingSize: 0,
                state: state
            };
            this.webSocketManager.sendMessage({
                channel: "progress",
                data: p,
                id: id
            });
            if (state === "cancel") {
                fs.unlink(downloadFileDestination, unlErr => {
                    notify("Download cancelled", fileName);
                    if (unlErr) {
                        return console.error(unlErr);
                    }
                });
            } else if (!error) {
                successCallback(downloadFileDestination);
            }
            this.appendLog("end", downloadName);
            this.cleanRequest(id);
        }).pipe(fs.createWriteStream(downloadFileDestination));
    }

    cancel(id: number) {
        const req = this.requestById[id];
        if (req) {
            req.abort();
            this.appendLog("cancel", this.downloadNameById[id]);
            this.stateById[id] = "cancel";
        } else {
            this.appendLog("cancel", id + " not found");
        }
    }

    pause(id: number) {
        const req = this.requestById[id];
        if (req) {
            req.pause();
            this.appendLog("pause", this.downloadNameById[id]);
            this.stateById[id] = "pause";
        } else {
            this.appendLog("pause", id + " not found");
        }
    }

    resume(id: number) {
        const req = this.requestById[id];
        if (req) {
            req.resume();
            this.appendLog("resume", this.downloadNameById[id]);
            delete this.stateById[id];
        } else {
            this.appendLog("resume", id + " not found");
        }
    }

    cleanRequest(id: number) {
        delete this.requestById[id];
        delete this.downloadNameById[id];
        delete this.stateById[id];
        this.webSocketManager.clean(id);
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
