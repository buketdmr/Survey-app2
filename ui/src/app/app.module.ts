import { LoaderInterceptor } from './interceptors/loader.interceptor';
import { LoaderService } from './services/loader.service';
import { LoadingComponent } from './main/shared/loader/loading.component';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import 'hammerjs';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; 
import { MomentModule } from 'angular2-moment';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';

import { fuseConfig } from 'app/fuse-config';


import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { UnderConstructionModule } from './main/shared/under-construction/under-construction.module';
import { SurveyModule } from './main/survey/survey.module';
import { SurveyListModule } from './main/survey-list/survey-list.module';

const appRoutes: Routes = [
    {
        path      : '**',
        redirectTo: 'home'
    }
];

@NgModule({
    declarations: [
        AppComponent,
        LoadingComponent,
    ],
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes),

        NgIdleKeepaliveModule.forRoot(),
        MomentModule,

        TranslateModule.forRoot(),

        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        // App modules
        LayoutModule,
        UnderConstructionModule,
        SurveyModule,
        SurveyListModule
    ],
    bootstrap   : [
        AppComponent
    ],
    providers   : [
        LoaderService,
        { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }
    ]
})  
export class AppModule
{
}
