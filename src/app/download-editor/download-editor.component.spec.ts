import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadEditorComponent } from './download-editor.component';

describe('DownloadEditorComponent', () => {
  let component: DownloadEditorComponent;
  let fixture: ComponentFixture<DownloadEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
