import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { UserTableFilter } from '../../interfaces/user-filter.interface';
import { UserAge } from '../../enums/user-age.enum';

@Component({
  selector: 'app-user-table-filter',
  standalone: true,
  imports: [FormsModule, NzInputModule, NzSelectModule],
  templateUrl: './user-table-filter.component.html',
  styleUrls: ['./user-table-filter.component.scss']
})
export class UserTableFilterComponent implements OnInit, OnDestroy {
  @Output() filterChange = new EventEmitter<UserTableFilter>();

  search: string = '';
  active: null | boolean = null;
  dob: null | UserAge = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(search => {
        this.search = search;
        this.emitFilterChange();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(search: string) {
    this.searchSubject.next(search.trim());
  }

  onFilterChange() {
    this.emitFilterChange();
  }

  private emitFilterChange() {
    this.filterChange.emit({
      search: this.search,
      active: this.active,
      dob: this.dob
    });
  }
}
