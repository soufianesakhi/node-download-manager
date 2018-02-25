import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { DownloadsListComponent } from './downloads-list/downloads-list.component';
import { FullTitleFilterPipe } from './utils/full-title-filter.pipe';
import { DownloadEditorComponent } from './download-editor/download-editor.component';
import { DownloadsService } from './service/downloads.service';
import { CategorySelectComponent } from './utils/category-select.component';
import { CategoryFilterPipe } from './utils/category-filter.pipe';
import { SortPipe } from './utils/sort.pipe';
import { HasCommentsPipe } from './utils/has-comments.pipe';

export const appRoutes: Routes = [
  {
    path: 'downloads-list',
    component: DownloadsListComponent
  }, {
    path: 'add-downloads',
    component: DownloadEditorComponent
  }, {
    path: 'edit-downloads',
    component: DownloadEditorComponent
  }, {
    path: 'edit-downloads/:id',
    component: DownloadEditorComponent
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
    HasCommentsPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [DownloadsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
