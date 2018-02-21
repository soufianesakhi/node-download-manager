import { Component, OnInit } from '@angular/core';
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

  onSelect(selectedLinks: DownloadLinksModel) {
    this.selectedLinks = selectedLinks;
  }
}
