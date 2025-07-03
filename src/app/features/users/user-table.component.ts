import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FormsModule } from '@angular/forms';
import { HighlightDirective } from './directives/highlight.directive';
import { UserTableFilterComponent } from './components/user-table-filter/user-table-filter.component';
import { UserTableFilter } from './interfaces/user-filter.interface';
import { LoaderComponent } from '../../shared/UI/loader/loader.component';
import { UserService } from './services/user.service';
import { User } from './interfaces/user.interface';
import { UserAge } from './enums/user-age.enum';

import { NzTableSortFn } from 'ng-zorro-antd/table';

interface ColumnItem {
  title: string;
  sortFn?: NzTableSortFn<User>;
}

@Component({
  selector: 'app-user-table',
  imports: [
    CommonModule,
    NzTableModule,
    NzInputModule,
    NzIconModule,
    NzSpinModule,
    FormsModule,
    HighlightDirective,
    UserTableFilterComponent,
    LoaderComponent,
  ],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
})
export class UserTableComponent implements OnInit {
  @ViewChild('userTable', { static: false }) userTable!: any;

  users: User[] = [];
  displayedUsers: User[] = [];
  filteredUsers: User[] = [];
  filter: UserTableFilter = { search: '', active: null, dob: null };
  isLoading: boolean = false;

  // TODO: infinity scroll
  // https://stackblitz.com/edit/nz-table-infinity-scroll-manual?file=src%2Fapp%2Fapp.component.ts

  // TODO: seaprate logic
  // Infinite scroll properties
  currentPage = 0;
  pageSize = 50;
  hasMoreData = true;
  isLoadingMore = false;

  headerColumn: ColumnItem[] = [
    {
      title: 'First Name',
      sortFn: (a: User, b: User) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Last Name',
      sortFn: (a: User, b: User) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'Date of Birth',
      sortFn: (a: User, b: User) =>
        new Date(a.dob).getTime() - new Date(b.dob).getTime(),
    },
    {
      title: 'Phone Number',
    },
    {
      title: 'Active',
    },
  ];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.isLoading = true;

    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.applyFiltersAndSorting();
      this.loadMoreUsers();
      this.isLoading = false;
    });
  }

  onFilterChange(filter: UserTableFilter) {
    this.filter = filter;
    this.resetPagination();
    this.applyFiltersAndSorting();
    this.loadMoreUsers();
  }

  applyFiltersAndSorting() {
    let filtered = [...this.users];
    // TODO: refactor this
    // Text search
    if (this.filter.search) {
      const searchQuery = this.filter.search.trim().toLowerCase();
      filtered = filtered.filter(
        user =>
          user.firstName.toLowerCase().includes(searchQuery) ||
          user.lastName.toLowerCase().includes(searchQuery) ||
          user.phone.toLowerCase().includes(searchQuery)
      );
    }

    // Active filter
    if (this.filter.active !== null) {
      filtered = filtered.filter(user => user.active === this.filter.active);
    }

    // DoB filter
    if (this.filter.dob) {
      filtered = filtered.filter(user => {
        const age =
          (Date.now() - new Date(user.dob).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000);
        return this.filter.dob === UserAge.UNDER_18 ? age < 18 : age >= 18;
      });
    }

    this.filteredUsers = filtered;
  }

  resetPagination() {
    this.currentPage = 0;
    this.displayedUsers = [];
    this.hasMoreData = true;
    this.isLoadingMore = false;
  }

  loadMoreUsers() {
    if (this.isLoadingMore || !this.hasMoreData) return;

    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const newUsers = this.filteredUsers.slice(startIndex, endIndex);

    if (newUsers.length > 0) {
      this.displayedUsers = [...this.displayedUsers, ...newUsers];
      this.currentPage++;
      this.hasMoreData = endIndex < this.filteredUsers.length;
    } else {
      this.hasMoreData = false;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    // debounce
    if (this.isLoadingMore || !this.hasMoreData) return;

    const element = event.target;
    const scrollTop = element.scrollTop || document.documentElement.scrollTop;
    const scrollHeight =
      element.scrollHeight || document.documentElement.scrollHeight;
    const clientHeight =
      element.clientHeight || document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 200) {
      this.isLoadingMore = true;
      this.loadMoreUsers();
      this.isLoadingMore = false;
    }
  }
}
