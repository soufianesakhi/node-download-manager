import 'source-map-support/register';
import * as mongoose from 'mongoose';
import * as url from 'url';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';
import { DownloadLinks } from '..';
import { DownloadLinksDAO } from '../server/dao/dl-links-dao';

let xlsxPath: string;
let tabName: string;
let catName: string;
let logFile: string;
let prioFactorStr: string;
let dbUrl: string;
[
    xlsxPath = 'S:/Downloads/test.xlsx',
    tabName = 'tab1',
    catName = tabName,
    prioFactorStr = "5",
    logFile = 'S:/Downloads/node-parser.log.txt',
    dbUrl = 'mongodb://localhost:27017/users'
] = process.argv.slice(2);

const prioFactor = Number.parseInt(prioFactorStr);

function appendLog(txt: string) {
    fs.appendFileSync(logFile, txt + "\n");
}

const connection = mongoose.connect(dbUrl);

function setFullTitle(downloadLinks: DownloadLinks) {
    const artistAndTitle = downloadLinks.title;
    const iSep = artistAndTitle.indexOf("-");
    downloadLinks.artist = artistAndTitle.substring(0, iSep).trim();
    downloadLinks.title = artistAndTitle.substring(iSep + 1).trim();
}

function initDownloadLinks(index: number): DownloadLinks {
    const priority = Math.round(((index + 1.0) / prioFactor) * 100) / 100.0 + 1;
    return {
        title: "",
        links: [[]],
        category: catName,
        priority: priority,
        comments: "",
        createdAt: new Date()
    };
}

function parseLinksAndComments(dlLinks: DownloadLinks) {
    const linksArray: string[][] = [];
    let hostArray: string[] = [];
    let prevHostName = "";
    dlLinks.links[0].forEach(line => {
        const u = url.parse(line);
        const currentHostname = u.hostname;
        if (currentHostname === "") {
            dlLinks.comments += line;
            return;
        }
        if (hostArray.length > 0 && prevHostName !== currentHostname) {
            linksArray.push(hostArray);
            hostArray = [];
        }
        const finalLink = url.format(u);
        if (finalLink !== "") {
            hostArray.push(finalLink);
        }
        prevHostName = currentHostname;
    });
    if (hostArray.length > 0) {
        linksArray.push(hostArray);
    }
    dlLinks.links = linksArray;
}

export function parseXLSX() {
    fs.writeFileSync(logFile, "Start parsing at: " + new Date().toISOString() + "\n");

    const workbook = XLSX.readFile(xlsxPath);
    const tabTxt = XLSX.utils.sheet_to_csv(workbook.Sheets[tabName], { FS: "µ$€" });

    let prevLine = "";
    let successCount = 0;
    let currentDlLinks = initDownloadLinks(0);
    const toSave: DownloadLinks[] = [];
    function addToSave() {
        parseLinksAndComments(currentDlLinks);
        setFullTitle(currentDlLinks);
        toSave.push(currentDlLinks);
    }
    tabTxt.split("\n").forEach((line, index) => {
        if (line !== "") {
            if (prevLine === "") {
                currentDlLinks.title = line;
            } else {
                currentDlLinks.links[0].push(line);
            }
        } else if (prevLine !== "") {
            addToSave();
            currentDlLinks = initDownloadLinks(index + 1);
        }
        prevLine = line;
    });
    if (currentDlLinks.title !== "") {
        addToSave();
    }
    let remaining = toSave.length;
    function decrementRemaining() {
        remaining--;
        if (remaining === 0) {
            done();
        }
    }
    toSave.forEach(links => {
        new DownloadLinksDAO(links).save().then(doc => {
            successCount++;
            decrementRemaining();
        }).catch(err => {
            console.error(err);
            appendLog(err);
            appendLog(JSON.stringify(links));
            decrementRemaining();
        });
    });
    if (remaining === 0) {
        console.error("Nothing to save");
        done();
    }
    function done() {
        appendLog("Success count: " + successCount);
        appendLog("End parsing at: " + new Date().toISOString());
        process.kill(process.pid);
    }
}
