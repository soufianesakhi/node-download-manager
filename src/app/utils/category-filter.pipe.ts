import { Pipe, PipeTransform } from '@angular/core';
import { DownloadLinks } from '../..';

@Pipe({
  name: 'categoryFilter'
})
export class CategoryFilterPipe implements PipeTransform {

  transform(items: DownloadLinks[], category: string): any {
    if (!items) {
      return [];
    }
    if (!category) {
      return items;
    }
    return items.filter(it => it.category === category);
  }
}
