import { exec } from 'child_process';
import { DownloadLinks } from '../..';
import { DownloadLinksIndexDAO } from '../dao/dl-links-dao';

export function index(rootPath: string, category: string, endCallback?: (code: number) => void) {
    const cmd = exec(`cd /D "${rootPath}" && @echo off && for /R %a in (*.*) do (if not [%~xa] == [] @echo %~na)`);
    const indexLinks: DownloadLinks[] = [];
    cmd.stdout.on('data', data => parse(data, category, indexLinks));
    cmd.stdout.on('close', () => {
        if (indexLinks.length > 0) {
            new DownloadLinksIndexDAO({
                name: rootPath,
                list: indexLinks
            }).save().then(() => {
                if (endCallback) {
                    endCallback(0);
                }
            }).catch(err => {
                console.error(err);
                if (endCallback) {
                    endCallback(-1);
                }
            });
        }
    });
    cmd.stdout.on('error', console.error);
    cmd.stderr.pipe(process.stderr);
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
            createdAt: new Date()
        });
    });
}
