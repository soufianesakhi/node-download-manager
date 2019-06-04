import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';
// tslint:disable-next-line:max-line-length
import { DownloadActionWSMessage, DownloadLinks, DownloadLinksEntry, DownloadLinksIndex, DownloadLinksModel, DownloadLinksWSMessage, DownloadProgress, DownloadSPI, ValueModel } from '../..';

@Injectable()
export class DownloadsService {
  spi: DownloadSPI;
  private newDownloadLinksSubject = new Subject<DownloadLinksModel>();
  private downloadProgressSubject = new Subject<DownloadProgress>();
  private webSocketClient: WebSocket;
  constructor(private http: Http) {
    this.startWebSocketConnection();
    this.getDownloadSPI().subscribe(spi => {
      this.spi = spi;
    });
  }

  getAllDownloadLinks() {
    const allDownloadLinksSubject = new Subject<DownloadLinksEntry[]>();
    this.http.get('/api/downloads')
      .map<any, DownloadLinksModel[]>(res => res.json())
      .subscribe(downloadLinks => {
        allDownloadLinksSubject.next(downloadLinks);
      });
    this.http.get('/api/indexes')
      .map<any, DownloadLinksIndex[]>(res => res.json())
      .subscribe(downloadLinksIndexes => {
        downloadLinksIndexes.forEach(index => {
          allDownloadLinksSubject.next(index.list.map(links => {
            const entry = links as DownloadLinksEntry;
            entry.indexName = index.name;
            return entry;
          }));
        });
      });
    return allDownloadLinksSubject;
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
    this.webSocketClient = new WebSocket("ws://" + window.location.host);
    this.webSocketClient.onmessage = (e) => {
      const message: DownloadLinksWSMessage = JSON.parse(e.data);
      const channel = message.channel;
      if (channel === "new") {
        this.newDownloadLinksSubject.next(message.data);
      } else if (channel === "progress") {
        this.downloadProgressSubject.next(message.data);
      }
    };
    this.webSocketClient.onerror = (e) => { console.log('WebSocket Connection Error'); };
    this.webSocketClient.onopen = () => { console.log('WebSocket Client Connected'); };
    this.webSocketClient.onclose = () => {
      console.log('WebSocket Client Closed. Retrying to connect after 1s...');
      setTimeout(() => this.startWebSocketConnection(), 1000);
    };
  }

  sendDownloadAction(message: DownloadActionWSMessage) {
    this.webSocketClient.send(JSON.stringify(message));
  }

  newDownloadLinksSubscribe(callback: (data: DownloadLinksModel) => void) {
    this.newDownloadLinksSubject.subscribe(callback);
  }

  downloadProgressSubscribe(callback: (data: DownloadProgress) => void) {
    this.downloadProgressSubject.subscribe(callback);
  }

  getDownloadSPI() {
    return this.http.get('/spi/download').map<any, DownloadSPI>(res => res.json());
  }

  downloadLinks(id) {
    if (!this.spi.supported) {
      console.warn("Download not supported");
      return;
    }
    return this.http.post(this.spi.path + '/' + id, "");
  }

  checkLinks(id) {
    if (!this.spi.supported) {
      console.warn("Download not supported");
      return;
    }
    return this.http.put(this.spi.path + '/' + id, "");
  }

}
