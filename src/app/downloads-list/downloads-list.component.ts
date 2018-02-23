import { Component, OnInit, ElementRef } from '@angular/core';
import { DownloadLinksModel } from '../..';
import { DownloadsService } from '../service/downloads.service';

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
  getAllLinks = this.downloadsService.stringifyLinks;

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
      this.removeFromArray(this.downloadLinks, this.selectedLinks);
      this.selectedLinks = this.downloadLinks[0];
    }, (error) => {
      console.error(error);
    });
  }

  copyFullTitle() {
    this.copyText(this.selectedLinks.artist + " - " + this.selectedLinks.title);
  }

  copyAllLinks() {
    this.copyText(this.getAllLinks(this.selectedLinks));
  }

  public removeFromArray(arr: any[], e) {
    const index = arr.indexOf(e);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }

  public copyText(text: string) {
    const input = document.createElement("textarea");
    input.textContent = text;
    document.body.appendChild(input);
    input.select();
    const successful = document.execCommand('copy');
    input.remove();
    alert(successful ? 'Copied' : 'Not copied');
  }

}
