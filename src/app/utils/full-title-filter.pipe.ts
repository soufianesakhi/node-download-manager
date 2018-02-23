import { Pipe, PipeTransform } from '@angular/core';
import { DownloadLinks } from '../..';

@Pipe({
  name: 'fullTitleFilter'
})
export class FullTitleFilterPipe implements PipeTransform {

  transform(items: DownloadLinks[], searchText: string): any {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
    const searched = searchText.split("&&");
    return items.filter(it => {
      return searched.every(txt => {
        txt = txt.trim();
        return this.includes(it.artist, txt) || this.includes(it.title, txt);
      });
    });
  }

  includes(text: string, searchText: string) {
    return text.toLowerCase().includes(searchText);
  }

}
