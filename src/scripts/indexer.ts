import * as mongoose from 'mongoose';
import { index, reindex } from "../server/service";

let rootPath, category, dbUrl, logDir;
[
    rootPath,
    category,
    dbUrl = 'mongodb://localhost:27017/users',
    logDir = "S:\\Downloads\\reindex"
] = process.argv.slice(2);
if (!rootPath || !category) {
    console.log(`Expected at least 2 arguments: root path, category, (optionnal) db url`);
    process.exit(-1);
}

mongoose.connect(dbUrl);

async function startIndex() {
    let code = await index(rootPath, category);
    if (code === 0) {
        code = await reindex(logDir, false);
    }
    process.exit(code);
}

startIndex();
