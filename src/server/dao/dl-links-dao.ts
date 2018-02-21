import { Document, model } from "mongoose";
import { TimeStampedSchema } from "./common-dao";
import { DownloadLinksModel } from "../..";

export const DownloadLinksDAO = model<DownloadLinksModel>('DownloadLinks', new TimeStampedSchema({
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
    previews: [String],
    sizeMB: Number
}));
