import { exec } from 'child_process';
import * as fs from 'fs';
import { DownloadLinksIndex } from 'model';
import { MongooseDocument } from 'mongoose';
import * as path from 'path';
import { DownloadLinks } from '../..';
import { DownloadLinksIndexDAO } from '../dao/dl-links-dao';

export async function index(rootPath: string, category: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        const cmd = exec(`cd /D "${rootPath}" && @echo off && for /R %a in (*.*) do (if not [%~xa] == [] @echo %~na)`);
        const indexLinks: DownloadLinks[] = [];
        cmd.stdout.on('data', data => parse(data, category, indexLinks));
        cmd.stdout.on('close', () => {
            if (indexLinks.length > 0) {
                new DownloadLinksIndexDAO({
                    name: rootPath,
                    list: indexLinks
                }).save().then(() => {
                    resolve(0);
                }).catch(err => {
                    console.error(err);
                    resolve(-1);
                });
            }
        });
        cmd.stdout.on('error', console.error);
        cmd.stderr.pipe(process.stderr);
    });
}

class Logger {
    constructor(private logPath: string) {
        fs.writeFileSync(logPath, '');
    }
    append(txt: string) {
        const time = new Date().toLocaleTimeString();
        fs.appendFileSync(this.logPath, `[${time}] ${txt}\n`);
    }
}

export async function reindex(logDir: string, dryRun: boolean): Promise<number> {
    if (! fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
    const infoLogger = new Logger(path.join(logDir, 'info.txt'));
    const toRemoveLogger = new Logger(path.join(logDir, 'toRemove.txt'));
    const toKeepLogger = new Logger(path.join(logDir, 'toKeep.txt'));
    return DownloadLinksIndexDAO.find({}).then(docs => {
        infoLogger.append(`Number of docs: ${docs.length}`);
        docs.sort((a, b) => {
            return getDocTimeMs(b) - getDocTimeMs(a);
        });

        const fullTitles: string[] = [];
        infoLogger.append(`Checking for redundant entries in indexes ...`);
        docs.forEach(doc => {
            infoLogger.append(``);
            const timestamp: Date = doc._id.getTimestamp();
            infoLogger.append(`${timestamp.toISOString()} - ${doc.name}`);
            let toBeRemoved = 0;
            const total = doc.list.length;
            let i = total;
            while (i--) {
                const e = doc.list[i];
                const fullTitle = e.artist + " - " + e.title;
                if (fullTitles.indexOf(fullTitle) > -1) {
                    toRemoveLogger.append(`${fullTitle} -> ${doc.name}`);
                    toBeRemoved++;
                    doc.list.splice(i, 1);
                } else {
                    toKeepLogger.append(`${fullTitle} -> ${doc.name}`);
                    fullTitles.push(fullTitle);
                }
            }
            infoLogger.append(`${toBeRemoved} / ${total} entries will be removed`);
            infoLogger.append(`Final list size: ${doc.list.length}`);
        });
        infoLogger.append(``);
        infoLogger.append(`Cleaning and merging duplicate indexes ...`);
        infoLogger.append(``);
        docs.sort((a, b) => {
            return getDocTimeMs(a) - getDocTimeMs(b);
        });
        const indexNameToIndex: {[name: string]: DownloadLinksIndex} = {};
        const indexesToUpdate: DownloadLinksIndex[] = [];
        docs.forEach(newerIndex => {
            const name = newerIndex.name;
            if (newerIndex.list.length === 0) {
                infoLogger.append(`Empty index to be removed: ${getIndexName(newerIndex)}`);
                if (!dryRun) {
                    return deleteIndex(newerIndex);
                }
            }
            const olderIndex = indexNameToIndex[name];
            indexNameToIndex[name] = newerIndex;
            if (olderIndex) {
                infoLogger.append(`Merging indexes: ${getIndexName(olderIndex)} -> ${getIndexName(newerIndex)}`);
                Array.prototype.push.apply(newerIndex.list, olderIndex.list);
                newerIndex.markModified("list");
                indexesToUpdate.push(newerIndex);
                if (!dryRun) {
                    deleteIndex(olderIndex);
                }
                infoLogger.append(`  ${newerIndex.name} new size: ${newerIndex.list.length}`);
            }
        });
        if (!dryRun && indexesToUpdate.length > 0) {
            return saveIndexes(indexesToUpdate, infoLogger);
        }
    }).catch(err => {
        console.error(err);
        return -1;
    });
}

async function deleteIndex(doc: DownloadLinksIndex) {
    await DownloadLinksIndexDAO.deleteOne({ _id: doc._id }).catch(err => {
        console.error(err);
    });
}

async function saveIndexes(indexes: DownloadLinksIndex[], infoLogger: Logger): Promise<number> {
    const promises = indexes.map(ix => {
        return ix.save().then(doc => {
            infoLogger.append(`Index saved: ${getIndexName(doc)}`);
        });
    });
    let error = false;
    await Promise.all(promises).catch(err => {
        console.error(err);
        error = true;
    });
    return error ? -1 : 0;
}

function getDocTimeMs(doc: MongooseDocument) {
    const date: Date = doc._id.getTimestamp();
    return date.getTime();
}

function getIndexName(doc: DownloadLinksIndex) {
    const timestamp: Date = doc._id.getTimestamp();
    return timestamp.toISOString() + " - " + doc.name;
}

function parse(data, category, indexLinks: DownloadLinks[]) {
    data.split("\n").forEach(artistAndTitle => {
        const iSep = artistAndTitle.indexOf("-");
        const title = artistAndTitle.substring(iSep + 1).trim();
        if (!title) {
            return;
        }
        indexLinks.push({
            artist: artistAndTitle.substring(0, iSep).trim(),
            title: title,
            links: [[]],
            category: category,
            updatedAt: new Date()
        });
    });
}
