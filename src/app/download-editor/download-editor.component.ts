import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { DownloadLinks, DownloadLinksModel } from "../..";
import { DownloadsService } from "../service/downloads.service";
import {
  parseLinks,
  setFullTitle,
  stringifyLinks
} from "../utils/downloads-utils";

@Component({
  selector: "app-download-editor",
  templateUrl: "./download-editor.component.html"
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
      priority: 1,
      createdAt: new Date()
    };
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get("id");
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
    this.downloadsService.getDownloadLinks(this.id).subscribe(
      links => {
        this.links = links;
      },
      error => {
        alert("Invalid id: " + this.id);
      }
    );
  }

  onSubmit() {
    let serviceObservable: Observable<DownloadLinksModel>;
    if (this.add) {
      serviceObservable = this.downloadsService.postDownloadLinks(this.links);
    } else {
      serviceObservable = this.downloadsService.updateDownloadLinks(this.links);
    }
    serviceObservable.subscribe(
      l => {
        if (l._id) {
          alert(l._id);
        }
      },
      error => {
        alert("Error");
        console.error(error);
      }
    );
  }

  getFullTitle() {
    if (this.links.artist) {
      return this.links.artist + " - " + this.links.title;
    }
    return this.links.title;
  }

  setFullTitle(artistAndTitle: string) {
    setFullTitle(this.links, artistAndTitle);
  }

  setAllLinks(allLinks: string) {
    this.links.links = parseLinks(allLinks);
  }

  stringifyArray(arr: string[]) {
    return arr ? arr.join("\n") : "";
  }

  parseArray(txt: string): string[] {
    return txt
      .split("\n")
      .map(s => s.trim())
      .filter(s => s !== "");
  }
}
