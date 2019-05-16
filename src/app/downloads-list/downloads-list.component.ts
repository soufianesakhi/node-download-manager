import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { DownloadLinksEntry, DownloadLinksModel } from '../..';
import { DownloadsService } from '../service/downloads.service';
import { copyText, flatLinks, removeFromArray, stringifyLinks } from '../utils/downloads-utils';

@Component({
  selector: 'app-downloads-list',
  templateUrl: './downloads-list.component.html'
})
export class DownloadsListComponent implements OnInit {
  downloadLinks: DownloadLinksEntry[] = [];
  selectedLinks: DownloadLinksEntry;
  selectedLinksMarginTop = 0;
  fullTitle = "";
  order = "createdAt";
  ascending = false;
  checkComents = "";
  category = "";
  flatLinks = flatLinks;
  filterMetadata = { count: 0 };
  downloadSupported: boolean;
  downloadSubmitted = false;

  constructor(private downloadsService: DownloadsService,
    private activatedRoute: ActivatedRoute) { }

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
      const order = params['sort'];
      if (order === "date") {
        this.order = "createdAt";
      } else if (order === "prio") {
        this.order = "priority";
      }
      const ascending = params['asc'];
      if (ascending != null) {
        this.ascending = ascending === "true";
      }
    });
  }

  onSelect(selectedLinks: DownloadLinksModel, event: Event, allLinksContainer: Element) {
    const selected = (event.target as Element).getBoundingClientRect();
    const containerOffsetTop = allLinksContainer.getBoundingClientRect().top;
    this.selectedLinksMarginTop = Math.max(selected.top - containerOffsetTop - 150, 0);
    this.selectedLinks = selectedLinks;
    this.downloadSubmitted = false;
  }

  isSelected(links: DownloadLinksModel) {
    return this.selectedLinks && links._id === this.selectedLinks._id;
  }

  getFullTitle(links: DownloadLinksModel) {
    return links.artist + (links.artist ? ' - ' : '') + links.title;
  }

  notIndexSelected() {
    return !this.selectedLinks.indexName;
  }

  deleteSelect() {
    this.downloadsService.deleteDownloadLinks(this.selectedLinks).subscribe(l => {
      removeFromArray(this.downloadLinks, this.selectedLinks);
      this.downloadLinks = this.downloadLinks.slice();
      this.selectedLinks = this.downloadLinks[0];
      this.filterMetadata.count--;
    }, (error) => {
      console.error(error);
    });
  }

  downloadSelect() {
    this.downloadSubmitted = true;
    this.downloadsService.downloadLinks(this.selectedLinks).subscribe(() => {
      console.log("Download submitted");
    });
  }

  hasMetaLinks() {
    return this.selectedLinks.sources.length > 0 || this.selectedLinks.previews.length;
  }

  copyFullTitle() {
    copyText(this.selectedLinks.artist + " - " + this.selectedLinks.title);
  }

  copyAllLinks() {
    copyText(stringifyLinks(this.selectedLinks));
  }

  openLinks() {
    flatLinks(this.selectedLinks).forEach(link => {
      window.open(link, '_blank');
    });
  }
}
