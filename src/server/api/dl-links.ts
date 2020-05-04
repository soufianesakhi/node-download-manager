import { Request, Response, Router } from "express";
import { DownloadLinksEntry, DownloadLinksModel } from "../..";
import { preUpdateTimeStaped } from "../dao/common-dao";
import { DownloadLinksDAO, DownloadLinksIndexDAO } from "../dao/dl-links-dao";
import { DownloadLinksWebSocketManager } from "../service/websocket";
import { handleError, notify } from "../util/utils";
import { MongoAPI } from "./mongo";

export class DownloadLinksAPI extends MongoAPI<DownloadLinksModel> {
  webSocketManager: DownloadLinksWebSocketManager;
  indexEntries: DownloadLinksEntry[] = [];
  constructor(router: Router, path: string) {
    super(router, DownloadLinksDAO, path);
    const appendLinksByIdPath = this.pathId(path + "/append");
    DownloadLinksIndexDAO.find({}).then((docs) => {
      docs.forEach((index) => {
        this.indexEntries.push(
          ...index.list.map((links) => {
            const entry = links as DownloadLinksEntry;
            entry.indexName = index.name;
            return entry;
          })
        );
      });
    });
    router.post(appendLinksByIdPath, this.appendLinksById.bind(this));
    router.get(path + "/search", this.searchAll.bind(this));
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
      id: links._id,
    });
  }

  searchAll(req: Request, res: Response) {
    const query = req.query;
    const search = query.search;
    const searchFields = query.searchFields;
    let conditions: Condition[];
    if (searchFields && search) {
        const searchQueries: string[] = search.split("||");
        const fields: string[] = searchFields.split(",");
        conditions = [];
        fields.forEach(field => {
            searchQueries.forEach((condition) => {
                const obj = {};
                obj[field] = new RegExp(".*" + condition + ".*", "i");
                conditions.push(obj);
            });
        });
    } else {
        return res.status(400).send("Missing query params: searchFields, search");
    }
    DownloadLinksDAO.find().or(conditions).then(docs => {
        docs = this.searchIndexes(conditions).concat(docs);
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

  searchIndexes(conditions: Condition[]) {
      return this.indexEntries.filter(entry => conditions.some(condition => {
        return Object.keys(condition).every(field => condition[field].test(entry[field]));
      }));
  }

  appendLinksById(req: Request, res: Response) {
    const id = this.getIdPath(req);
    if (!id) {
      return handleError("Id not found in path: " + req.originalUrl, res);
    }
    DownloadLinksDAO.findById(id)
      .then((links) => {
        const updatedLinks: DownloadLinksModel = req.body;
        links.links.push(...updatedLinks.links);
        links.sources.push(...updatedLinks.sources);
        links.previews.push(...updatedLinks.previews);
        new DownloadLinksDAO(links)
          .save()
          .then((doc) => {
            res.send(doc);
            notify("Success", doc.sources);
          })
          .catch((err) => handleError(err, res));
      })
      .catch((err) => handleError(err, res));
  }
}

interface Condition { [field: string]: RegExp; }
