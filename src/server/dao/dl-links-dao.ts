import { Document, Model, Schema, model } from "mongoose";
import { TimeStampedModel, TimeStampedSchema } from "./common-dao";

export interface DownloadLinks extends TimeStampedModel {
    artist: string;
    title: string;
    links: string[][];
    priority: number;
    sources: string[];
    sizeMB: number;
}

export interface DownloadLinksModel extends DownloadLinks, Document { }

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
    sizeMB: Number
}));
