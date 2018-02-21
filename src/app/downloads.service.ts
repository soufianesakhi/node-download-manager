import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { DownloadLinks, DownloadLinksModel } from '..';

@Injectable()
export class DownloadsService {

  constructor(private http: Http) { }

  getAllDownloadLinks() {
    return this.http.get('/api/downloads').map<any, DownloadLinksModel[]>(res => res.json());
  }

  saveDownloadLinks(links: DownloadLinks) {
    return this.http.post('/api/downloads', links).map<any, DownloadLinksModel>(res => res.json());
  }

}
