import { Request, Response, Express, Router } from 'express';
import { DownloadLinksAPI } from './dl-links';
import { ValueModel } from '../..';
import { MongoAPI } from './mongo';
import { getValueDAO } from '../dao/value-dao';
import { WebSocketManager } from '../websocket';

export class ApiRegistry {
    private router = Router();
    private downloadLinksAPI: DownloadLinksAPI;

    constructor(app: Express) {
        this.router.get('/', this.get);
        this.downloadLinksAPI = new DownloadLinksAPI(this.router, '/downloads');
        this.downloadLinksAPI.init();
        new MongoAPI<ValueModel>(this.router, getValueDAO("Category"), '/categories').init();
        app.use('/api', this.router);
    }

    private get(req: Request, res: Response) {
        res.send('api works');
    }

    public setWebSocketManager(manager: WebSocketManager) {
        this.downloadLinksAPI.setWebSocketManager(manager);
    }
}
