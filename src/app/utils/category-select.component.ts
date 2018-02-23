import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DownloadsService } from '../service/downloads.service';

@Component({
  selector: 'app-category-select',
  template: `
    <select [class.form-control]="form" name="categoryInput" [ngModel]="value" (ngModelChange)="change($event)">
      <option *ngFor="let c of categories" [selected]="c === value">{{c}}</option>
    </select>
  `
})
export class CategorySelectComponent implements OnInit {
  @Input()
  value: string;
  @Input()
  form: boolean;
  @Input()
  emptyFirst: boolean;
  @Output()
  valueChange = new EventEmitter<string>();
  categories: string[];

  constructor(private downloadsService: DownloadsService) { }

  ngOnInit() {
    this.downloadsService.getCategories().subscribe(values => {
      this.categories = values.map(v => v.value);
      if (this.emptyFirst) {
        this.categories = [""].concat(this.categories);
      }
    });
  }

  change(newValue: string) {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

}
