import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { DownloadEditorComponent } from "./download-editor/download-editor.component";
import { DownloadProgressComponent } from "./download-progress/download-progress.component";
import { DownloadsListComponent } from "./downloads-list/downloads-list.component";
import { DownloadsService } from "./service/downloads.service";
import { CategoryFilterPipe } from "./utils/category-filter.pipe";
import { CategorySelectComponent } from "./utils/category-select.component";
import { FullTitleFilterPipe } from "./utils/full-title-filter.pipe";
import { HasCommentsPipe } from "./utils/has-comments.pipe";
import { SortPipe } from "./utils/sort.pipe";

export const appRoutes: Routes = [
  {
    path: "downloads-list",
    component: DownloadsListComponent
  },
  {
    path: "add-downloads",
    component: DownloadEditorComponent
  },
  {
    path: "edit-downloads",
    component: DownloadEditorComponent
  },
  {
    path: "edit-downloads/:id",
    component: DownloadEditorComponent
  },
  {
    path: "download-progress",
    component: DownloadProgressComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    DownloadsListComponent,
    FullTitleFilterPipe,
    DownloadEditorComponent,
    CategorySelectComponent,
    CategoryFilterPipe,
    SortPipe,
    HasCommentsPipe,
    DownloadProgressComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [DownloadsService],
  bootstrap: [AppComponent]
})
export class AppModule {}
