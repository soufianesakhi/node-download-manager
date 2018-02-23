import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { DownloadsListComponent } from './downloads-list/downloads-list.component';
import { DownloadsFilterPipe } from './utils/downloads-filter.pipe';
import { DownloadEditorComponent } from './download-editor/download-editor.component';
import { DownloadsService } from './service/downloads.service';
import { CategorySelectComponent } from './utils/category-select.component';

const appRoutes: Routes = [
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
    DownloadsFilterPipe,
    DownloadEditorComponent,
    CategorySelectComponent
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
