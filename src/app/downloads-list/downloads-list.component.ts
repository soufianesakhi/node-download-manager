import { Component, OnInit, ElementRef } from '@angular/core';
import { DownloadLinksModel } from '../..';
import { DownloadsService } from '../service/downloads.service';
import { flatLinks, stringifyLinks, removeFromArray, copyText } from '../utils/downloads-utils';

@Component({
  selector: 'app-downloads-list',
  templateUrl: './downloads-list.component.html'
})
export class DownloadsListComponent implements OnInit {
  downloadLinks: DownloadLinksModel[] = [];
  selectedLinks: DownloadLinksModel;
  selectedLinksMarginTop = 0;
  fullTitle = "";
  order = "priority";
  ascending = true;
  checkComents = "";
  flatLinks = flatLinks;

  constructor(private downloadsService: DownloadsService) { }

  ngOnInit() {
    this.downloadsService.getAllDownloadLinks().subscribe(downloadLinks => {
      this.downloadLinks = downloadLinks;
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
    }, (error) => {
      console.error(error);
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
