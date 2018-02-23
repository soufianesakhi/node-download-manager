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
  order = "dateCreated";
  flatLinks = flatLinks;

  constructor(private downloadsService: DownloadsService) { }

  ngOnInit() {
    this.downloadsService.getAllDownloadLinks().subscribe(downloadLinks => {
      this.downloadLinks = downloadLinks;
      if (downloadLinks.length > 0) {
        this.selectedLinks = downloadLinks[0];
      }
    });
  }

  onSelect(selectedLinks: DownloadLinksModel, event: Event, allLinksContainer: Element) {
    const selectedOffsetTop = (event.target as Element).getBoundingClientRect().top;
    const containerOffsetTop = allLinksContainer.getBoundingClientRect().top;
    this.selectedLinksMarginTop = selectedOffsetTop - containerOffsetTop;
    this.selectedLinks = selectedLinks;
  }

  deleteSelect() {
    this.downloadsService.deleteDownloadLinks(this.selectedLinks).subscribe(l => {
      removeFromArray(this.downloadLinks, this.selectedLinks);
      this.selectedLinks = this.downloadLinks[0];
    }, (error) => {
      console.error(error);
    });
  }

  copyFullTitle() {
    copyText(this.selectedLinks.artist + " - " + this.selectedLinks.title);
  }

  copyAllLinks() {
    copyText(stringifyLinks(this.selectedLinks));
  }
}
