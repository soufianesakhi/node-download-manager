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

    interface DownloadProgress {
        id: number;
        title: string;
        fileName: string;
        /** Between 0 and 100 */
        percent: number;
        /** Mega Bytes per second */
        speed: number;
        /** Seconds */
        remainingTime: number;
        /** Mega Bytes */
        remainingSize: number;
    }

    interface DownloadLinksWSMessage {
        channel: "new" | "progress";
        data: any;
    }

}
