import { Component, OnInit, ElementRef } from '@angular/core';
import { DownloadLinksModel, DownloadSPI } from '../..';
import { DownloadsService } from '../service/downloads.service';
import { flatLinks, stringifyLinks, removeFromArray, copyText } from '../utils/downloads-utils';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-downloads-list',
  templateUrl: './downloads-list.component.html'
})
export class DownloadsListComponent implements OnInit {
  downloadLinks: DownloadLinksModel[] = [];
  selectedLinks: DownloadLinksModel;
  selectedLinksMarginTop = 0;
  fullTitle = "";
  order = "createdAt";
  ascending = false;
  checkComents = "";
  flatLinks = flatLinks;
  filterMetadata = { count: 0 };
  downloadSupported: boolean;

  constructor(private downloadsService: DownloadsService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.downloadsService.getAllDownloadLinks().subscribe(downloadLinks => {
      this.downloadLinks = downloadLinks;
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
    const selectedOffsetTop = (event.target as Element).getBoundingClientRect().top;
    const containerOffsetTop = allLinksContainer.getBoundingClientRect().top;
    this.selectedLinksMarginTop = selectedOffsetTop - containerOffsetTop;
    this.selectedLinks = selectedLinks;
  }

  getSelectedLinksMarginTop() {
    return Math.max(this.selectedLinksMarginTop - 150, 0);
  }

  isSelected(links: DownloadLinksModel) {
    return this.selectedLinks && links._id === this.selectedLinks._id;
  }

  deleteSelect() {
    this.downloadsService.deleteDownloadLinks(this.selectedLinks).subscribe(l => {
      removeFromArray(this.downloadLinks, this.selectedLinks);
      this.selectedLinks = this.downloadLinks[0];
      this.filterMetadata.count--;
    }, (error) => {
      console.error(error);
    });
  }

  downloadSelect() {
    this.downloadsService.downloadLinks(this.selectedLinks).subscribe(() => {
      console.log("Download submitted");
    });
  }

  hasMetaLinks() {
    return this.selectedLinks.sources.length > 0 && this.selectedLinks.previews.length;
  }

  copyFullTitle() {
    copyText(this.selectedLinks.artist + " - " + this.selectedLinks.title);
  }

  copyAllLinks() {
    copyText(stringifyLinks(this.selectedLinks));
  }
}
