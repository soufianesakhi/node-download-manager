import { Request, Response, Express, Router } from 'express';
import { Connection } from 'mongoose';
import * as express from 'express';
import { MongoAPI } from './mongo';
import { DownloadLinksAPI } from './dl-links';

export class ApiRegistry {
    private router = Router();

    private constructor() {
        this.router.get('/', this.get);
        new DownloadLinksAPI(this.router, '/downloads').init();
    }

    public static init(app: Express) {
        const registry = new ApiRegistry();
        app.use('/api', registry.router);
    }

    private get(req: Request, res: Response) {
        res.send('api works');
    }
}
