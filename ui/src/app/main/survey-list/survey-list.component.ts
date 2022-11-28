import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { MatPaginator } from '@angular/material/paginator';

import 'rxjs/add/operator/filter';
import { SurveyService } from '../../services/survey.service';
import { Survey } from '../../models/survey';

@Component({
    selector: 'app-survey-list',
    templateUrl: './survey-list.component.html',
    styleUrls: ['./survey-list.component.scss'],
})
export class SurveyListComponent implements OnInit {
    dataSource: any;
    array: any;
    displayedColumns: string[];
    length: number = 0;
    currentPage: number = 0;
    pageSize: number = 10;
    showSurveyList: boolean = false;
    showNotFound: boolean = false;
    isEditable: boolean = true;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    constructor(
        private surveyService: SurveyService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {

        this.route.paramMap.subscribe(params => {
            let surveyGuid = params.get("guid");
            this.surveyService.checkGuid(surveyGuid).subscribe((data) => {
                this.surveyService.guid = surveyGuid;
                this.showSurveyList = true;
                this.showNotFound = false;
                this.setup();
            }, (err) => {
                this.surveyService.guid = null;
                this.showSurveyList = false;
                this.showNotFound = true;
            });


        });

    }

    setup() {
        this.displayedColumns = ['name'];
        this.get();
    }

    get() {
        this.surveyService.getSurveys().subscribe((result) => {
            this.array = result.data.map(m => {
                return {
                    id: m.id,
                    name: m.name ?? '<Unnamed>'
                }
            });
            this.dataSource = new MatTableDataSource<Survey>(this.array);
            this.dataSource.paginator = this.paginator;
            this.length = result.data.length;
            this.iterator();

        });
    }

    navigateToSurvey(id: number) {
        this.router.navigate([`/surveygroup/${this.surveyService.guid}/survey/${id}`]);
    }

    create() {
        this.router.navigate([`/surveygroup/${this.surveyService.guid}/survey/new`]);
    }

    applyFilter(filterValue) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    public handlePage(e: any) {
        this.currentPage = e.pageIndex;
        this.pageSize = e.pageSize;
        this.iterator();
    }

    private iterator() {
        const end = (this.currentPage + 1) * this.pageSize;
        const start = this.currentPage * this.pageSize;
        const part = this.array.slice(start, end);
        this.dataSource = part;
    }
}
