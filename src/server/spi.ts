import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

export interface SPI {
    register(app: Express);
}

export function registerSPI(app: Express) {
    const spiRoot = path.join(__dirname, 'spi');
    fs.exists(spiRoot, exists => {
        if (exists) {
            loadSPIModules(spiRoot, app);
        }
    });
}

function loadSPIModules(fullSPIPath: string, app: Express) {
    fs.lstat(fullSPIPath, function (err, stat) {
        if (stat.isDirectory()) {
            fs.readdir(fullSPIPath, function (dirErr, files) {
                files.filter(fileName => fileName.endsWith(".js"))
                    .map(fileName => path.join(fullSPIPath, fileName))
                    .forEach(filePath => loadSPIModules(filePath, app));
            });
        } else {
            require(fullSPIPath)(app);
        }
    });
}
