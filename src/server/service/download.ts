import * as fs from 'fs';
import { DownloadProgress, DownloadState } from 'model';
import * as path from 'path';
import { Subscription } from 'rxjs';
import { killFiles, startDownload, sudPath } from 'su-downloader3';
import { notify } from '../util/utils';
import { DownloadActionListener, DownloadLinksWebSocketManager } from './websocket';


export class DownloadManager implements DownloadActionListener {
    private downloadsLogFile: string;
    requestById: { [id: number]: Subscription } = {};
    metaById: { [id: number]: DownloadMetaData } = {};
    downloaderOptions = {
        threads: 1,
        throttleRate: 1000,
        timeout: 40 * 1000
    };

    constructor(private webSocketManager: DownloadLinksWebSocketManager, private downloadDirectory: string) {
        this.downloadsLogFile = path.join(downloadDirectory, "downloads.logs.txt");
        this.webSocketManager.registerDownloadActionListener(this);
    }

    download(directDownloadURI: string,
            title: string,
            fileName: string,
            _id: number,
            index: number,
            successCallback: (finalFilePath: string) => void,
            errorCallback: (errorMsg: string) => void) {
        const id = _id + index;
        const downloadFileDestination = path.join(this.downloadDirectory, fileName);
        const downloadName = title + " ;; " + fileName + " ;; " + id;
        const meta: DownloadMetaData = {
            _id, id, title, fileName, downloadName, downloadFileDestination, directDownloadURI,
            successCallback, errorCallback
        };
        this.metaById[id] = meta;
        this.downloadStart(meta);
        this.appendLog("start", downloadName);
    }

    downloadStart(meta: DownloadMetaData) {
        const locations = { url: meta.directDownloadURI, savePath: meta.downloadFileDestination };
        const req = startDownload(locations, this.downloaderOptions).subscribe({
            next: p => this.onProgress(p, meta),
            error: e => this.onError(e, meta),
            complete: () => this.onEnd(meta)
        });
        this.requestById[meta.id] = req;
    }

    onProgress(state: SuDownloaderProgressInfos, meta: DownloadMetaData) {
        const p: DownloadProgress = {
            id: meta.id,
            _id: meta._id,
            title: meta.title,
            fileName: meta.fileName,
            percent: state.total ? this.format(state.total.percentage) : 0,
            speed: this.format(state.avgSpeed / 1e6),
            remainingTime: state.time ? this.format(state.time.eta) : 0,
            remainingSize: state.total ? this.format((state.total.filesize - state.total.downloaded) / 1e6) : 0,
            state: meta.state
        };
        this.webSocketManager.sendMessage({
            channel: "progress",
            data: p,
            id: meta.id
        });
    }

    onError(err: Error, meta: DownloadMetaData) {
        console.error(err);
        this.appendLog("error", meta.downloadName + "\n\t==>" + err);
        meta.state = "error";
        this.notifyErrorState(meta);
        this.sendEndProgres(meta);
    }

    sendEndProgres(meta: DownloadMetaData) {
        const p: DownloadProgress = {
            id: meta.id,
            _id: meta._id,
            title: meta.title,
            fileName: meta.fileName,
            percent: 100,
            speed: 0,
            remainingTime: 0,
            remainingSize: 0,
            state: meta.state
        };
        this.webSocketManager.sendMessage({
            channel: "progress",
            data: p,
            id: meta.id
        });
    }

    onEnd(meta: DownloadMetaData) {
        this.sendEndProgres(meta);
        this.appendLog("end", meta.downloadName);
        this.cleanRequest(meta.id);
        killFiles(sudPath(meta.downloadFileDestination));
        meta.successCallback(meta.downloadFileDestination);
    }

    notifyErrorState(meta: DownloadMetaData) {
        const errorMsg = "Download " + meta.state;
        notify(errorMsg, meta.id);
        meta.errorCallback(errorMsg);
    }

    cancel(id: number) {
        const req = this.requestById[id];
        if (req) {
            req.unsubscribe();
            const meta = this.metaById[id];
            this.appendLog("cancel", meta.downloadName);
            meta.state = "cancel";
            this.notifyErrorState(meta);
            this.sendEndProgres(meta);
            this.cleanRequest(meta.id);
            fs.unlink(meta.downloadFileDestination, unlErr => {
                if (unlErr) {
                    return console.error(unlErr);
                }
            });
        } else {
            this.appendLog("cancel", id + " not found");
        }
    }

    pause(id: number) {
        const req = this.requestById[id];
        if (req) {
            req.unsubscribe();
            const meta = this.metaById[id];
            this.appendLog("pause", meta.downloadName);
            meta.state = "pause";
        } else {
            this.appendLog("pause", id + " not found");
        }
    }

    resume(id: number) {
        const meta = this.metaById[id];
        this.downloadStart(meta);
        this.appendLog("resume", meta.downloadName);
        delete meta.state;
    }

    cleanRequest(id: number) {
        delete this.requestById[id];
        delete this.metaById[id];
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
interface DownloadMetaData {
    _id: number;
    id: number;
    title: string;
    fileName: string;
    downloadName: string;
    downloadFileDestination: string;
    directDownloadURI: string;
    successCallback: (finalFilePath: string) => void;
    errorCallback: (errorMsg: string) => void;
    state?: DownloadState;
}

interface SuDownloaderProgressInfos {
    time: {
        /** timestamp */
        start: number,
        /** milliseconds */
        elapsed: number,
        /** seconds */
        eta: number
    };
    total: {
        /** bytes */
        filesize: number,
        /** bytes */
        downloaded: number,
        /** real number between 0 and 100 */
        percentage: number
    };
    instance: {
        /** bytes */
        downloaded: number,
        /** real number between 0 and 100 */
        percentage: number
    };
    /** bytes per second */
    speed: number;
    /** bytes per second */
    avgSpeed: number;
    /** array of bytes */
    threadPositions: number[];
}
