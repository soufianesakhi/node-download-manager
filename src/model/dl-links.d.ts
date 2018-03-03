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
        fileName: string;
        percent: number; // Between 0 and 100
        speed: number; // Mega Bytes per second
        remainingTime: number; // Seconds
        remainingSize: number; // Mega Bytes
    }

    interface DownloadLinksWSMessage {
        channel: "new" | "progress";
        data: any;
    }

}
