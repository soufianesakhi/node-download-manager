import { model } from "mongoose";
import { DownloadLinksIndex, DownloadLinksModel } from "../..";
import { TimeStampedSchema } from "./common-dao";

const DownloadLinksSchema = new TimeStampedSchema({
    artist: String,
    title: {
        type: String,
        required: true
    },
    links: {
        type: [[String]],
        required: true
    },
    category: String,
    priority: Number,
    sources: [String],
    previews: [String],
    sizeMB: Number,
    comments: String
});
export const DownloadLinksDAO = model<DownloadLinksModel>('DownloadLinks', DownloadLinksSchema);

export const DownloadLinksIndexDAO = model<DownloadLinksIndex>('DownloadLinksIndex', new TimeStampedSchema({
    name: {
        type: String,
        required: true
    },
    list: [DownloadLinksSchema]
}));
