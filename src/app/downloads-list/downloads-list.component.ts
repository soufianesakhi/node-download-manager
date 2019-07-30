import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { DownloadLinksEntry, DownloadLinksModel } from "../..";
import { DownloadsService } from "../service/downloads.service";
import {
  copyText,
  flatLinks,
  removeFromArray,
  setFullTitle,
  stringifyLinks
} from "../utils/downloads-utils";

@Component({
  selector: "app-downloads-list",
  templateUrl: "./downloads-list.component.html"
})
export class DownloadsListComponent implements OnInit {
  downloadLinks: DownloadLinksEntry[] = [];
  selectedLinks: DownloadLinksEntry;
  fullTitle = "";
  order = "createdAt";
  ascending = false;
  checkComents = "";
  category = "";
  flatLinks = flatLinks;
  filterMetadata = { count: 0 };
  downloadSupported: boolean;
  downloadSubmitted = false;
  editingSelectedTitle = false;

  constructor(
    private downloadsService: DownloadsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.downloadsService.getAllDownloadLinks().subscribe(downloadLinks => {
      this.downloadLinks.push(...downloadLinks);
      this.downloadLinks = this.downloadLinks.slice();
    });
    this.downloadsService.newDownloadLinksSubscribe(links => {
      this.downloadLinks.splice(0, 0, links);
      this.filterMetadata.count++;
      this.selectedLinks = links;
    });
    this.downloadsService.getDownloadSPI().subscribe(spi => {
      this.downloadSupported = spi.supported;
    });
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      const order = params["sort"];
      if (order === "date") {
        this.order = "createdAt";
      } else if (order === "prio") {
        this.order = "priority";
      }
      const ascending = params["asc"];
      if (ascending != null) {
        this.ascending = ascending === "true";
      }
      const category = params["cat"];
      if (category != null) {
        this.category = category;
      }
    });
  }

  onSelect(
    selectedLinks: DownloadLinksModel,
    event: Event,
    allLinksContainer: Element
  ) {
    this.selectedLinks = selectedLinks;
    this.downloadSubmitted = false;
  }

  isSelected(links: DownloadLinksModel) {
    return this.selectedLinks && links._id === this.selectedLinks._id;
  }

  getFullTitle(links: DownloadLinksModel) {
    return links.artist + (links.artist ? " - " : "") + links.title;
  }

  notIndexSelected() {
    return !this.selectedLinks.indexName;
  }

  deleteSelect() {
    this.downloadsService.deleteDownloadLinks(this.selectedLinks).subscribe(
      l => {
        removeFromArray(this.downloadLinks, this.selectedLinks);
        this.downloadLinks = this.downloadLinks.slice();
        this.selectedLinks = this.downloadLinks[0];
        this.filterMetadata.count--;
      },
      error => {
        console.error(error);
      }
    );
  }

  downloadSelect() {
    this.downloadSubmitted = true;
    this.downloadsService
      .downloadLinks(this.selectedLinks._id)
      .subscribe(() => {
        console.log("Download submitted");
      });
  }

  checkSelect() {
    this.downloadsService.checkLinks(this.selectedLinks._id).subscribe(() => {
      console.log("Check submitted");
    });
  }

  saveSelectedLinks() {
    this.downloadsService
      .updateDownloadLinks(this.selectedLinks)
      .subscribe(result => {
        console.log("Saved selected links");
        console.log(result);
      });
  }

  hasMetaLinks() {
    return (
      this.selectedLinks.sources.length > 0 ||
      this.selectedLinks.previews.length
    );
  }

  copyFullTitle() {
    copyText(this.selectedLinks.artist + " - " + this.selectedLinks.title);
  }

  setFullTitle(artistAndTitle: string) {
    setFullTitle(this.selectedLinks, artistAndTitle);
  }

  copyAllLinks() {
    copyText(stringifyLinks(this.selectedLinks));
  }

  copyId(idCopyConfirm: HTMLElement) {
    copyText(this.selectedLinks._id);
    idCopyConfirm.style.display = "inline";
    setTimeout(() => {
      idCopyConfirm.style.display = "none";
    }, 1000);
  }

  openLinks() {
    flatLinks(this.selectedLinks).forEach(link => {
      window.open(link, "_blank");
    });
  }
}
