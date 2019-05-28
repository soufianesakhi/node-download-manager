import { Component, OnInit } from '@angular/core';
import { DownloadProgress, DownloadProgressMetaData, DownloadState } from '../..';
import { DownloadsService } from '../service/downloads.service';

@Component({
  selector: 'app-download-progress',
  templateUrl: './download-progress.component.html',
  styles: []
})
export class DownloadProgressComponent implements OnInit {

  progressArray: DownloadProgressMetaData[] = [];
  progressById: { [id: string]: DownloadProgress } = {};

  constructor(private downloadsService: DownloadsService) { }

  ngOnInit() {
    this.downloadsService.downloadProgressSubscribe(progress => {
      const id = progress.id;
      const firstProgressForId = this.progressById[id] == null;
      if (progress.state === "error") {
        progress.state = "cancel";
      }
      this.progressById[id] = progress;
      if (firstProgressForId) {
        this.progressArray.push({
          id: progress.id,
          _id: progress._id,
          title: progress.title,
          fileName: progress.fileName
        });
      }
    });
  }

  cancel(id: number) {
    this.do("cancel", id);
  }

  pause(id: number) {
    this.do("pause", id);
  }

  resume(id: number) {
    this.do("resume", id);
  }

  restart(id) {
    this.downloadsService.downloadLinks(this.progressById[id]._id).subscribe(() => {
      console.log("Download restarted");
    });
  }

  do(action: DownloadState, id: number) {
    this.progressById[id].state = action;
    this.downloadsService.sendDownloadAction({ action: action, id: id });
  }

  inProgress(progressMetadata: DownloadProgressMetaData): boolean {
    return this.progressById[progressMetadata.id].percent !== 100;
  }

  isCompleted(progressMetadata: DownloadProgressMetaData): boolean {
    const progress = this.progressById[progressMetadata.id];
    return progress.percent === 100 && progress.state !== "cancel";
  }

  isPaused(progressMetadata: DownloadProgressMetaData): boolean {
    const progress = this.progressById[progressMetadata.id];
    return progress.state === "pause";
  }

  isCancelled(progressMetadata: DownloadProgressMetaData): boolean {
    const progress = this.progressById[progressMetadata.id];
    return progress.state === "cancel";
  }

  formatTime(secondsTotal: number) {
    const minutes = Math.floor(secondsTotal / 60);
    const seconds = Math.floor(secondsTotal - (minutes * 60));
    return (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  mockProgress() {
    const progress: DownloadProgress = {
      id: 1,
      _id: 1,
      title: "Artist - Title",
      fileName: "File Name",
      percent: 60,
      speed: 1,
      remainingTime: 100,
      remainingSize: 5,
      state: "resume"
    };
    this.progressById[progress.id] = progress;
    this.progressArray.push(progress);
  }

}
