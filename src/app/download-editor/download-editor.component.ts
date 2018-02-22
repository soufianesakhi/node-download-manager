import { Component, OnInit, Input } from '@angular/core';
import { DownloadLinksModel, DownloadLinks } from '../..';
import { ActivatedRoute } from '@angular/router';
import { DownloadsService } from '../downloads.service';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-download-editor',
  templateUrl: './download-editor.component.html',
  styleUrls: ['./download-editor.component.css']
})
export class DownloadEditorComponent implements OnInit {
  add: boolean;
  id: string;
  links: DownloadLinks;
  categories: string[];
  getAllLinks = this.downloadsService.getAllLinks;

  constructor(
    private route: ActivatedRoute,
    private downloadsService: DownloadsService
  ) {
    this.links = {
      title: "",
      links: [[""]],
      category: "",
      priority: 1
    };
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (!this.id) {
        return;
      }
      this.downloadsService.getDownloadLinks(this.id).subscribe(links => {
        this.links = links;
      }, (error) => {
        alert("Invalid id: " + this.id);
      });
    });
    this.downloadsService.getCategories().subscribe(values => {
      this.categories = values.map(v => v.value);
    });
    this.route.url.subscribe(url => {
      this.add = url[0].toString().startsWith("add-");
    });
  }

  onSubmit(f: NgForm) {
    const artistAndTitle = f.value.fullTitleInput;
    const iSep = artistAndTitle.indexOf("-");
    this.links.artist = artistAndTitle.substring(0, iSep).trim();
    this.links.title = artistAndTitle.substring(iSep + 1).trim();
    this.links.links = this.getLinksArray(f.value.linksInput);
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

  getLinksArray(txt: string) {
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
