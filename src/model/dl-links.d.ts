import { Document } from "mongoose";
declare module "model" {
    interface DownloadLinks extends TimeStampedModel {
        artist?: string;
        title: string;
        links: string[][];
        category: string;
        priority?: number;
        sources?: string[];
        previews?: string[];
        sizeMB?: number;
        comments?: string;
    }

    interface DownloadLinksModel extends DownloadLinks, Document { }

    interface DownloadLinksEntry extends DownloadLinksModel {
        indexName?: string;
    }

    interface DownloadLinksIndex extends TimeStampedModel, Document {
        name: string;
        list: DownloadLinksModel[];
    }

    interface DownloadProgressMetaData {
        id: number;
        _id: any;
        title: string;
        fileName: string;
    }

    type DownloadState = "cancel" | "pause" | "resume" | "error";

    interface DownloadProgress extends DownloadProgressMetaData {
        /** Between 0 and 100 */
        percent: number;
        /** Mega Bytes per second */
        speed: number;
        /** Seconds */
        remainingTime: number;
        /** Mega Bytes */
        remainingSize: number;
        state: DownloadState;
    }

    interface DownloadLinksWSMessage {
        channel: "new" | "progress";
        id: number;
        data: any;
    }

    interface DownloadActionWSMessage {
        action: DownloadState;
        id: number;
    }

}
