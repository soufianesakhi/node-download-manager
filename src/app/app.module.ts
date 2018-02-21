import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { DownloadsListComponent } from './downloads-list/downloads-list.component';
import { DownloadsService } from './downloads.service';
import { DownloadsFilterPipe } from './downloads-filter.pipe';

const appRoutes: Routes = [
  {
    path: 'downloads-list',
    component: DownloadsListComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    DownloadsListComponent,
    DownloadsFilterPipe
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
