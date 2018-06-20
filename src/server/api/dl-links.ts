import { MongoAPI } from "./mongo";
import { DownloadLinksDAO } from "../dao/dl-links-dao";
import { Request, Response, Router } from 'express';
import { handleError, notify } from "../util/utils";
import { DownloadLinks, DownloadLinksModel } from "../..";
import { preUpdateTimeStaped } from "../dao/common-dao";
import { DownloadLinksWebSocketManager } from "../service/websocket";

export class DownloadLinksAPI extends MongoAPI<DownloadLinksModel> {
    webSocketManager: DownloadLinksWebSocketManager;
    constructor(router: Router, path: string) {
        super(router, DownloadLinksDAO, path);
        const appendLinksByIdPath = this.pathId(path + "/append");
        router.post(appendLinksByIdPath, this.appendLinksById.bind(this));
    }

    public setWebSocketManager(manager: DownloadLinksWebSocketManager) {
        this.webSocketManager = manager;
    }

    preUpdate(d: DownloadLinksModel) {
        preUpdateTimeStaped(null, d);
    }

    postSuccessCallback(links: DownloadLinksModel) {
        this.webSocketManager.sendMessage({
            channel: "new",
            data: links,
            id: links._id
        });
    }

    appendLinksById(req: Request, res: Response) {
        const id = this.getIdPath(req);
        if (!id) {
            return handleError("Id not found in path: " + req.originalUrl, res);
        }
        DownloadLinksDAO.findById(id)
            .then(links => {
                const updatedLinks: DownloadLinksModel = req.body;
                links.links.push(...updatedLinks.links);
                links.sources.push(...updatedLinks.sources);
                links.previews.push(...updatedLinks.previews);
                new DownloadLinksDAO(links).save().then(doc => {
                    res.send(doc);
                    notify('Success', doc.sources);
                }).catch(err => handleError(err, res));
            }).catch(err => handleError(err, res));
    }
}
