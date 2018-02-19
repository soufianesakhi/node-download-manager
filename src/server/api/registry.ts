import { Request, Response, Express, Router } from 'express';
import { Connection } from 'mongoose';
import { UsersAPI } from './users';
import * as express from 'express';

export class ApiRegistry {
    private router = Router();

    private constructor() {
        this.router.get('/', this.get);
        new UsersAPI(this.router).init('/users');
    }

    public static init(app: Express) {
        const registry = new ApiRegistry();
        app.use('/api', registry.router);
    }

    private get(req: Request, res: Response) {
        res.send('api works');
    }
}
