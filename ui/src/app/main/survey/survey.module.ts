import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialogModule } from '@angular/material/dialog';

import { SurveyComponent } from './survey.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule, MAT_CHECKBOX_CLICK_ACTION } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { SurveyService } from 'app/services/survey.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const routes = [
    {
        path: 'surveygroup/:guid/survey/:gsId',
        component: SurveyComponent,
        canActivate: [],
        data: { },
    },
];

@NgModule({
    declarations: [SurveyComponent],
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
        MatSlideToggleModule,
        MatCheckboxModule,
        MatSelectModule,
        MatStepperModule,
        MatIconModule,
        MatTabsModule,
        MatButtonToggleModule,
        MatDialogModule,
        MatSnackBarModule,
    ],
    providers: [SurveyService, { provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop' }],
})
export class SurveyModule {}
