import { Request, Response, Router } from 'express';
import { notify, handleError } from '../util/utils';
import { Document, Model } from 'mongoose';

export class MongoAPI<D extends Document> {
    private ID_PATH = "id";
    constructor(private router: Router, private Dao: Model<D>, private path: string) { }

    init() {
        this.router.get(this.path, this.getAll.bind(this));
        this.router.post(this.path, this.post.bind(this));
        this.router.post(this.path + "/search", this.search.bind(this));

        const idPath = this.pathId(this.path);
        this.router.delete(idPath, this.deleteById.bind(this));
        this.router.get(idPath, this.getById.bind(this));
    }

    getAll(req: Request, res: Response) {
        this.Dao.find({}).then(docs => {
            res.send(docs);
        }).catch(err => handleError(err, res));
    }

    post(req: Request, res: Response) {
        new this.Dao(req.body).save().then(doc => {
            res.send(doc);
            notify('Success', doc);
        }).catch(err => handleError(err, res));
    }

    search(req: Request, res: Response) {
        let conditions = req.body;
        if (!conditions) {
            return handleError("Body not found", res);
        }
        const query = req.query;
        if (query.contains) {
            const regExpConditions = {};
            Object.keys(conditions).forEach(c => {
                regExpConditions[c] = new RegExp(".*" + conditions[c] + ".*", "i");
            });
            conditions = regExpConditions;
        }
        this.Dao.find(conditions).then(docs => {
            res.send(docs);
        }).catch(err => handleError(err, res));
    }

    getById(req: Request, res: Response) {
        const id = this.getIdPath(req);
        if (!id) {
            return handleError("Id not found in path: " + req.originalUrl, res);
        }
        this.Dao.findById(id).then(doc => {
            res.send(doc);
        }).catch(err => handleError(err, res));
    }

    deleteById(req: Request, res: Response) {
        const id = this.getIdPath(req);
        if (!id) {
            return handleError("Id not found in path: " + req.originalUrl, res);
        }
        this.Dao.findByIdAndRemove(id).then(() => {
            const okMsg = id + " removed";
            res.send(okMsg);
            notify('Success', okMsg);
        }).catch(err => handleError(err, res));
    }

    pathId(path: string) {
        return path + "/:" + this.ID_PATH;
    }

    getIdPath(req: Request) {
        return req.params[this.ID_PATH];
    }
}
