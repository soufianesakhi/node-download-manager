import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { DownloadLinks, DownloadLinksModel, ValueModel } from '..';

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

  stringifyLinks(selectedLinks: DownloadLinksModel) {
    const allLinks: string[] = [];
    selectedLinks.links.forEach(l => allLinks.push(...l));
    return allLinks.join("\n");
  }

  parseLinks(txt: string) {
    const linksArray: string[][] = [];
    let hostArray: string[] = [];
    let prevHostName = "";
    txt.split("\n").forEach(link => {
      const currentHostname = this.getHostName(link);
      if (hostArray.length > 0 && prevHostName !== currentHostname) {
        linksArray.push(hostArray);
        hostArray = [];
      }
      const finalLink = link.trim();
      if (finalLink !== "") {
        hostArray.push(finalLink);
      }
      prevHostName = currentHostname;
    });
    if (hostArray.length > 0) {
      linksArray.push(hostArray);
    }
    return linksArray;
  }

  getHostName(url) {
    const l = document.createElement("a");
    l.href = url;
    const hostname = l.hostname;
    l.remove();
    return hostname;
  }
}
