import { Express, Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { DownloadSPI } from '..';

export const SPIPath = '/spi';
const metadata: DownloadSPI = {
    supported: false,
    path: "",
    ignoredCats: []
};

export function registerSPI(app: Express) {
    const router = Router();
    app.use(SPIPath, router);
    router.get("/download", (req, res) => {
        res.send(metadata);
    });

    const spiRoot = path.join(__dirname, 'spi');
    fs.exists(spiRoot, exists => {
        if (exists) {
            loadSPIModules(spiRoot, app, router);
        }
    });
}

function loadSPIModules(fullSPIPath: string, app: Express, router: Router) {
    fs.lstat(fullSPIPath, function (err, stat) {
        if (stat.isDirectory()) {
            fs.readdir(fullSPIPath, function (dirErr, files) {
                files.filter(fileName => fileName.endsWith(".js"))
                    .map(fileName => path.join(fullSPIPath, fileName))
                    .forEach(filePath => loadSPIModules(filePath, app, router));
            });
        } else {
            const module = require(fullSPIPath);
            if (typeof module === "function") {
                module(app, metadata, router);
            }
        }
    });
}
