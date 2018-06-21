import { Express, Request, Response, Router } from 'express';
import { DownloadLinksIndexDAO } from '../dao/dl-links-dao';
import { getValueDAO } from '../dao/value-dao';
import { DownloadLinksWebSocketManager } from '../service/websocket';
import { DownloadLinksAPI } from './dl-links';
import { MongoAPI } from './mongo';

export class ApiRegistry {
    private router = Router();
    private downloadLinksAPI: DownloadLinksAPI;

    constructor(app: Express) {
        this.router.get('/', this.get);
        this.downloadLinksAPI = new DownloadLinksAPI(this.router, '/downloads');
        this.downloadLinksAPI.init();
        new MongoAPI(this.router, getValueDAO("Category"), '/categories').init();
        new MongoAPI(this.router, DownloadLinksIndexDAO, '/indexes').init();
        app.use('/api', this.router);
    }

    private get(req: Request, res: Response) {
        res.send('api works');
    }

    public setWebSocketManager(manager: DownloadLinksWebSocketManager) {
        this.downloadLinksAPI.setWebSocketManager(manager);
    }
}
