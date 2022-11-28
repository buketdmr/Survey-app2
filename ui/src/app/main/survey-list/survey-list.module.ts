import { NgModule } from '@angular/core';
import { RouterModule, ExtraOptions } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SurveyListComponent } from './survey-list.component';
import { SurveyService } from '../../services/survey.service';

const routes = [
    {
        path: 'surveygroup/:guid',
        component: SurveyListComponent,
        canActivate: [],
        data: { },
    },
];

@NgModule({
    declarations: [SurveyListComponent],
    imports: [
        RouterModule.forChild(routes),

        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        MatTableModule,
        MatInputModule,
        MatGridListModule,
        MatButtonModule,
        MatFormFieldModule,
        MatBadgeModule,
        MatSortModule,
        MatPaginatorModule,
    ],
    providers: [SurveyService],
})
export class SurveyListModule {}
