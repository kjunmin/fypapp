import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatWindowComponent } from './stat-window.component';

describe('StatWindowComponent', () => {
  let component: StatWindowComponent;
  let fixture: ComponentFixture<StatWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
