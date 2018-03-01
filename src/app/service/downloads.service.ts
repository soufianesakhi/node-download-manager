import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { DownloadLinks, DownloadLinksModel, ValueModel, DownloadSPI } from '../..';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class DownloadsService {
  spi: DownloadSPI;
  newDownloadLinksSubject: Subject<DownloadLinksModel>;
  constructor(private http: Http) {
    this.newDownloadLinksSubject = new Subject();
    this.startWebSocketConnection();
    this.getDownloadSPI().subscribe(spi => {
      this.spi = spi;
    });
  }

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

  startWebSocketConnection() {
    const client = new WebSocket("ws://" + window.location.host);
    client.onmessage = (e) => {
      this.newDownloadLinksSubject.next(JSON.parse(e.data));
    };
    client.onerror = (e) => { console.log('WebSocket Connection Error', e); };
    client.onopen = () => { console.log('WebSocket Client Connected'); };
    client.onclose = () => { console.log('WebSocket Client Closed'); };
  }

  newDownloadLinksSubscribe(callback: (data: DownloadLinksModel) => void) {
    this.newDownloadLinksSubject.subscribe(callback);
  }

  getDownloadSPI() {
    return this.http.get('/spi/download').map<any, DownloadSPI>(res => res.json());
  }

  downloadLinks(data: DownloadLinksModel) {
    if (!this.spi.supported) {
      console.warn("Download not supported");
      return;
    }
    return this.http.post(this.spi.path + '/' + data._id, "");
  }

}
