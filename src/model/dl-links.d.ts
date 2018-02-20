import { Document } from "mongoose";
import { TimeStampedModel } from "./common";

export interface DownloadLinksModel extends TimeStampedModel {
    artist: string;
    title: string;
    links: string[][];
    priority: number;
    sources: string[];
    sizeMB: number;
}

export interface DownloadLinks extends DownloadLinksModel, Document { }
