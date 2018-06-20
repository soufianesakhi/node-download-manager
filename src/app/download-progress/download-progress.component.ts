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

  cancel(id: number, progressBar: HTMLElement) {
    progressBar.classList.remove("bg-info", "bg-warning");
    progressBar.classList.add("bg-danger");
    this.downloadsService.sendDownloadAction({ action: "cancel", id: id });
  }

  pause(id: number, progressBar: HTMLElement) {
    progressBar.classList.remove("bg-info");
    progressBar.classList.add("bg-warning");
    this.downloadsService.sendDownloadAction({ action: "pause", id: id });
  }

  resume(id: number, progressBar: HTMLElement) {
    progressBar.classList.remove("bg-warning");
    progressBar.classList.add("bg-info");
    this.downloadsService.sendDownloadAction({ action: "resume", id: id });
  }

}
