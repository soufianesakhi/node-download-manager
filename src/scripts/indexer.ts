import * as mongoose from 'mongoose';
import { index } from "../server/service";

let rootPath, category, dbUrl;
[
    rootPath,
    category,
    dbUrl = 'mongodb://localhost:27017/users'
] = process.argv.slice(2);
if (!rootPath || !category) {
    console.log(`Expected at least 2 arguments: root path, category, (optionnal) db url`);
    process.exit(-1);
}

mongoose.connect(dbUrl);
index(rootPath, category, code => {
    process.exit(code);
});
