import { Pipe, PipeTransform } from '@angular/core';
import { DownloadLinks } from 'model';

@Pipe({
  name: 'customFilters'
})
export class CustomFiltersPipe implements PipeTransform {

  transform(items: DownloadLinks[], order: string, ignoredCats: string[], filterMetadata): DownloadLinks[] {
    if (!items) {
      filterMetadata.count = 0;
      return [];
    }
    return items.filter(it => {
      return order !== "priority" || ignoredCats.indexOf(it.category) < 0;
    }).slice(0);
  }

}
