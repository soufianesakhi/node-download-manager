import { Pipe, PipeTransform } from '@angular/core';
import { DownloadLinks } from '../..';

@Pipe({
  name: 'fullTitleFilter'
})
export class FullTitleFilterPipe implements PipeTransform {

  transform(items: DownloadLinks[], searchText: string, filterMetadata): DownloadLinks[] {

    if (!items) {
      filterMetadata.count = 0;
      return [];
    }
    if (!searchText) {
      filterMetadata.count = items.length;
      return items;
    }
    searchText = searchText.toLowerCase();
    const searched = searchText.split("&&");
    const filteredItems = items.filter(it => {
      return searched.every(txt => {
        txt = txt.trim();
        return this.includes(it.artist, txt) || this.includes(it.title, txt);
      });
    });
    filterMetadata.count = filteredItems.length;
    return filteredItems;
  }

  includes(text: string, searchText: string) {
    return text.toLowerCase().includes(searchText);
  }

}
