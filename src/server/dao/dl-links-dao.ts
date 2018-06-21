import { Document, model, Schema } from "mongoose";
import { TimeStampedSchema } from "./common-dao";
import { DownloadLinks, DownloadLinksModel, DownloadLinksIndex } from "../..";

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
    category: String,
    priority: Number,
    sources: [String],
    previews: [String],
    sizeMB: Number,
    comments: String
}));

export const DownloadLinksIndexDAO = model<DownloadLinksIndex>('DownloadLinksIndex', new TimeStampedSchema({
    name: {
        type: String,
        required: true
    },
    list: [new Schema({
        artist: String,
        title: String,
    })]
}));
