import * as mongoose from 'mongoose';
import { reindex } from "../server/service";

let dbUrl, dryRun, logDir;
[
    dbUrl = 'mongodb://localhost:27017/users',
    dryRun = false,
    logDir = "S:\\Downloads\\reindex"
] = process.argv.slice(2);

mongoose.connect(dbUrl);

async function startReindex() {
    const code = await reindex(logDir, dryRun);
    process.exit(code);
}

startReindex();
