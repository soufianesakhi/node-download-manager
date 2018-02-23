import { Pipe, PipeTransform } from '@angular/core';
import { DownloadLinks } from '../..';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {
  transform(items: DownloadLinks[], orderBy: string, asc: boolean) {
    if (!items || items.length === 0) {
      return [];
    }
    if (!orderBy || orderBy.trim() === "") {
      return items;
    }
    let i = -1;
    while (!items[++i]) { }
    let comparator = this.getOrderByComparator(items[i][orderBy]);
    if (!asc) {
      comparator = this.getInverseComparator(comparator);
    }
    return items.sort((item1, item2) => {
      return comparator(item1[orderBy], item2[orderBy]);
    });
  }

  getInverseComparator(comp: (a, b) => number): (a, b) => number {
    return (l, r) => {
      return comp(r, l);
    };
  }

  getOrderByComparator(sample): (a, b) => number {
    let comp: (a, b) => number;
    if ((isNaN(parseFloat(sample)) || !isFinite(sample))) {
      comp = (a, b) => {
        if (a.toLowerCase() < b.toLowerCase()) { return -1; }
        if (a.toLowerCase() > b.toLowerCase()) { return 1; }
        return 0;
      };
    } else { // number
      comp = (a, b) => {
        if (parseFloat(a) < parseFloat(b)) { return -1; }
        if (parseFloat(a) > parseFloat(b)) { return 1; }
        return 0;
      };
    }
    return (a, b) => {
      if (a == null) {
        return -1;
      }
      if (b == null) {
        return 1;
      }
      return comp(a, b);
    };
  }
}
