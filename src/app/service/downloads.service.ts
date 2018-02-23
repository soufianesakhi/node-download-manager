import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { DownloadLinks, DownloadLinksModel, ValueModel } from '../..';

@Injectable()
export class DownloadsService {

  constructor(private http: Http) { }

  getAllDownloadLinks() {
    return this.http.get('/api/downloads').map<any, DownloadLinksModel[]>(res => res.json());
  }

  getDownloadLinks(id: string) {
    return this.http.get('/api/downloads/' + id).map<any, DownloadLinksModel>(res => res.json());
  }

  deleteDownloadLinks(links: DownloadLinksModel) {
    return this.http.delete('/api/downloads/' + links._id);
  }

  postDownloadLinks(links: DownloadLinks) {
    return this.http.post('/api/downloads', links).map<any, DownloadLinksModel>(res => res.json());
  }

  updateDownloadLinks(links: DownloadLinks) {
    return this.http.put('/api/downloads', links).map<any, DownloadLinksModel>(res => res.json());
  }

  getCategories() {
    return this.http.get('/api/categories').map<any, ValueModel[]>(res => res.json());
  }

}
