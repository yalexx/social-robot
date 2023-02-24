import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';

/**
 * @title Table retrieving data through HTTP
 */
@Component({
    selector   : 'table-http-example',
    styleUrls  : ['table-http-example.css'],
    templateUrl: 'table-http-example.html'
})
export class TableHttpExample implements AfterViewInit
{
    displayedColumns = ['created', 'state', 'number', 'title'];
    exampleDatabase: ExampleHttpDao | null;
    dataSource = new MatTableDataSource();

    resultsLength = 0;
    isLoadingResults = false;
    isRateLimitReached = false;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private http: HttpClient)
    {
    }

    ngAfterViewInit()
    {
        this.exampleDatabase = new ExampleHttpDao(this.http);

        // If the user changes the sort order, reset back to the first page.
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        Observable.merge(this.sort.sortChange, this.paginator.page)
                  .startWith(null)
                  .switchMap(() => {
                      setTimeout(() => {
                          this.isLoadingResults = true;
                      });
                      return this.exampleDatabase!.getRepoIssues(
                          this.sort.active, this.sort.direction, this.paginator.pageIndex);
                  })
                  .map(data => {
                      // Flip flag to show that loading has finished.
                      this.isLoadingResults = false;
                      this.isRateLimitReached = false;
                      this.resultsLength = data.total_count;

                      return data.items;
                  })
                  .catch(() => {
                      setTimeout(() => {
                          this.isLoadingResults = false;
                          // Catch if the GitHub API has reached its rate limit. Return empty data.
                          this.isRateLimitReached = true;
                      });
                      return Observable.of([]);
                  })
                  .subscribe(data => this.dataSource.data = data);
    }
}

export interface GithubApi
{
    items: GithubIssue[];
    total_count: number;
}

export interface GithubIssue
{
    created_at: string;
    number: string;
    state: string;
    title: string;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDao
{
    constructor(private http: HttpClient)
    {
    }

    getRepoIssues(sort: string, order: string, page: number): Observable<GithubApi>
    {
        const href = 'https://api.github.com/search/issues';
        const requestUrl =
                  `${href}?q=repo:angular/material2&sort=${sort}&order=${order}&page=${page + 1}`;

        return this.http.get<GithubApi>(requestUrl);
    }
}
