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
        // TODO
    }

    interface DownloadLinksWSMessage {
        channel: "new" | "progress";
        data: any;
    }

}
