import { Component, OnInit } from '@angular/core';
import { DownloadsService } from '../service/downloads.service';
import { DownloadProgress } from '../..';

@Component({
  selector: 'app-download-progress',
  templateUrl: './download-progress.component.html',
  styles: []
})
export class DownloadProgressComponent implements OnInit {

  progressArray: DownloadProgress[] = [];
  progressIdToIndex: { [id: string]: number } = {};

  constructor(private downloadsService: DownloadsService) { }

  ngOnInit() {
    this.downloadsService.downloadProgressSubscribe(progress => {
      if (this.progressIdToIndex[progress.id] == null) {
        const progressIndex = this.progressArray.length;
        this.progressArray.push(progress);
        this.progressIdToIndex[progress.id] = progressIndex;
      } else {
        const progressIndex = this.progressIdToIndex[progress.id];
        this.progressArray.splice(progressIndex, 1, progress);
      }
    });
  }

}
