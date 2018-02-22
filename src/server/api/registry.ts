import { Request, Response, Express, Router } from 'express';
import { DownloadLinksAPI } from './dl-links';
import { ValueModel } from '../..';
import { MongoAPI } from './mongo';
import { getValueDAO } from '../dao/value-dao';

export class ApiRegistry {
    private router = Router();

    private constructor() {
        this.router.get('/', this.get);
        new DownloadLinksAPI(this.router, '/downloads').init();
        new MongoAPI<ValueModel>(this.router, getValueDAO("Category"), '/categories').init();
    }

    public static init(app: Express) {
        const registry = new ApiRegistry();
        app.use('/api', registry.router);
    }

    private get(req: Request, res: Response) {
        res.send('api works');
    }
}
