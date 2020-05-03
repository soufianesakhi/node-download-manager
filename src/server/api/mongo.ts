import { Request, Response, Router } from 'express';
import { ObjectId } from 'mongodb';
import { Document, Model } from 'mongoose';
import { handleError, notify } from '../util/utils';

export class MongoAPI<D extends Document> {
    private ID_PATH = "id";
    constructor(private router: Router, private Dao: Model<D>, private path: string) { }

    init() {
        this.router.get(this.path, this.getAll.bind(this));
        this.router.post(this.path, this.post.bind(this));
        this.router.put(this.path, this.update.bind(this));
        this.router.post(this.path + "/search", this.search.bind(this));
        this.router.get(this.path + "/search", this.search.bind(this));

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
            this.postSuccessCallback(doc);
            if (!req.query.silent) {
                notify('Success', doc._id + " created");
            }
        }).catch(err => handleError(err, res));
    }

    postSuccessCallback(doc: Document) { }

    update(req: Request, res: Response) {
        this.preUpdate(req.body);
        this.Dao.update({ _id: new ObjectId(req.body._id) }, req.body).then(doc => {
            res.send(doc);
            notify('Success', doc);
        }).catch(err => handleError(err, res));
    }

    preUpdate(d: D) { }

    search(req: Request, res: Response) {
        const body = req.body;
        const query = req.query;
        const condition = query.condition;
        const searchFields = query.searchFields;
        let conditions: any[];
        if (!body || Object.keys(body).length === 0) {
            if (searchFields && condition) {
                const fields: string[] = searchFields.split(",");
                conditions = fields.map(field => {
                    const obj = {};
                    obj[field] = condition;
                    return obj;
               });
            } else {
                return handleError("Body not found", res);
            }
        } else {
            conditions = body.conditions;
        }
        if (query.contains) {
            conditions = conditions.map(obj => {
                Object.keys(obj).forEach(field => {
                    obj[field] = new RegExp(".*" + obj[field] + ".*", "i");
                });
                return obj;
            });
        }
        this.Dao.find().or(conditions).then(docs => {
            const mapFields = query.mapFields;
            if (mapFields) {
                const fields: string[] = mapFields.split(",");
                res.send(docs.map(doc => {
                    return fields.reduce((acc, field) => {
                        acc[field] = doc[field];
                        return acc;
                   }, {});
                }));
            } else {
                res.send(docs);
            }
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
            res.send(id);
            notify('Success', id + " removed");
        }).catch(err => handleError(err, res));
    }

    pathId(path: string) {
        return path + "/:" + this.ID_PATH;
    }

    getIdPath(req: Request) {
        return req.params[this.ID_PATH];
    }
}
