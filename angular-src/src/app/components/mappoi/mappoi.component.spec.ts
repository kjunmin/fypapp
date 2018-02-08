import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappoiComponent } from './mappoi.component';

describe('MappoiComponent', () => {
  let component: MappoiComponent;
  let fixture: ComponentFixture<MappoiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappoiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
