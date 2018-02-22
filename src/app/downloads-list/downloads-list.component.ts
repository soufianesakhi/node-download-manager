import { Component, OnInit, ElementRef } from '@angular/core';
import { DownloadLinksModel } from '../..';
import { DownloadsService } from '../downloads.service';

@Component({
  selector: 'app-downloads-list',
  templateUrl: './downloads-list.component.html',
  styleUrls: ['./downloads-list.component.css']
})
export class DownloadsListComponent implements OnInit {
  downloadLinks: DownloadLinksModel[] = [];
  selectedLinks: DownloadLinksModel;
  selectedLinksMarginTop = 0;
  searchText = "";
  order = "dateCreated";

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

  getAllLinks(selectedLinks: DownloadLinksModel) {
    const allLinks: string[] = [];
    selectedLinks.links.forEach(l => allLinks.push(...l));
    return allLinks.join("\r\n");
  }

  copyFullTitle() {
    this.copyText(this.selectedLinks.artist + " - " + this.selectedLinks.title);
  }

  copyAllLinks() {
    this.copyText(this.getAllLinks(this.selectedLinks));
  }

  private copyText(text: string) {
    const input = document.createElement("textarea");
    input.textContent = text;
    document.body.appendChild(input);
    input.select();
    const successful = document.execCommand('copy');
    input.remove();
    alert(successful ? 'Copied' : 'Not copied');
  }

}
