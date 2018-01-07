import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapgreedyComponent } from './mapgreedy.component';

describe('MapgreedyComponent', () => {
  let component: MapgreedyComponent;
  let fixture: ComponentFixture<MapgreedyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapgreedyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapgreedyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
