import { Document, model } from "mongoose";
import { TimeStampedSchema } from "./common-dao";
import { DownloadLinks } from "../../model/dl-links";

export const DownloadLinksDAO = model<DownloadLinks>('DownloadLinks', new TimeStampedSchema({
    artist: String,
    title: {
        type: String,
        required: true
    },
    links: {
        type: [[String]],
        required: true
    },
    priority: Number,
    sources: [String],
    sizeMB: Number
}));
