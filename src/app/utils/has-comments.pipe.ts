import { Pipe, PipeTransform } from '@angular/core';
import { DownloadLinks } from '../..';

@Pipe({
  name: 'hasComments'
})
export class HasCommentsPipe implements PipeTransform {

  transform(items: DownloadLinks[], hasComments: string): any {
    if (!items) {
      return [];
    }
    if (!hasComments) {
      return items;
    }
    const withComments = hasComments === 'true';
    return items.filter(it => {
      return !it.comments !== withComments;
    });
  }


}
