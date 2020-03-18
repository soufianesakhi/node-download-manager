import { Pipe, PipeTransform } from '@angular/core';
import { DownloadLinks } from 'model';

@Pipe({
  name: 'customFilters'
})
export class CustomFiltersPipe implements PipeTransform {

  transform(
    items: DownloadLinks[],
    order: string,
    ignoredCats: string[],
    maxDateStr: string,
    maxPriorityStr: string,
    filterMetadata
  ): DownloadLinks[] {  if (!items) {
      filterMetadata.count = 0;
      return [];
    }
    if (maxDateStr != null) {
      try {
        const maxDate = Date.parse(maxDateStr);
        if (!isNaN(maxDate)) {
          items = items.filter(it => {
            const createAt: any = it.updatedAt || it.createdAt;
            return Date.parse(createAt) <= maxDate;
          });
        }
      } catch (e) {}
    }
    if (maxPriorityStr != null) {
      try {
        const maxPriority = Number.parseFloat(maxPriorityStr);
        if (!isNaN(maxPriority)) {
          items = items.filter(it => {
            return it.priority <= maxPriority;
          });
        }
      } catch (e) {}
    }
    const filteredItems = items.filter(it => {
      return order !== "priority" || ignoredCats.indexOf(it.category) < 0;
    }).slice(0);
    filterMetadata.count = filteredItems.length;
    return filteredItems;
  }

}
