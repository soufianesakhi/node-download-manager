import { Component, OnInit, Input } from '@angular/core';
import { DownloadLinksModel, DownloadLinks } from '../..';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { DownloadsService } from '../service/downloads.service';
import { stringifyLinks, parseLinks } from '../utils/downloads-utils';

@Component({
  selector: 'app-download-editor',
  templateUrl: './download-editor.component.html'
})
export class DownloadEditorComponent implements OnInit {
  add: boolean;
  id: string;
  links: DownloadLinks;
  getAllLinks = stringifyLinks;

  constructor(
    private route: ActivatedRoute,
    private downloadsService: DownloadsService
  ) {
    this.links = {
      title: " - ",
      links: [["\n"]],
      category: "",
      priority: 1
    };
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      this.updateDownloadLinks();
    });
    this.route.url.subscribe(url => {
      this.add = url[0].toString().startsWith("add-");
    });
  }

  submitId(id: string) {
    this.id = id;
    this.updateDownloadLinks();
  }

  updateDownloadLinks() {
    if (!this.id) {
      return;
    }
    this.downloadsService.getDownloadLinks(this.id).subscribe(links => {
      this.links = links;
    }, (error) => {
      alert("Invalid id: " + this.id);
    });
  }

  onSubmit() {
    let serviceObservable: Observable<DownloadLinksModel>;
    if (this.add) {
      serviceObservable = this.downloadsService.postDownloadLinks(this.links);
    } else {
      serviceObservable = this.downloadsService.updateDownloadLinks(this.links);
    }
    serviceObservable.subscribe(l => {
      if (l._id) {
        alert(l._id);
      }
    }, (error) => {
      alert("Error");
      console.error(error);
    });
  }

  getFullTitle() {
    if (this.links.artist) {
      return this.links.artist + " - " + this.links.title;
    }
    return this.links.title;
  }

  setFullTitle(artistAndTitle: string) {
    const iSep = artistAndTitle.indexOf("-");
    this.links.artist = artistAndTitle.substring(0, iSep).trim();
    this.links.title = artistAndTitle.substring(iSep + 1).trim();
  }

  setAllLinks(allLinks: string) {
    this.links.links = parseLinks(allLinks);
  }

  stringifyArray(arr: string[]) {
    return arr ? arr.join("\n") : "";
  }

  parseArray(txt: string): string[] {
    return txt.split("\n").map(s => s.trim()).filter(s => s !== "");
  }
}
