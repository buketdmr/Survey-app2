import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    Inject,
} from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { environment } from '../../../../../../environments/environment';

import { FuseConfigService } from '@fuse/services/config.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'navbar-horizontal-style-1',
    templateUrl: './style-1.component.html',
    styleUrls: ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NavbarHorizontalStyle1Component implements OnInit, OnDestroy {
    fuseConfig: any;

    surveyGuid: string = null;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.fuseConfig = config;
            });

        this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd) {
                const mergedParams = this.mergeRouteParams(this.router);
                if (mergedParams.guid && mergedParams.guid.length > 0) {
                    this.surveyGuid = mergedParams.guid;
                } else {
                    this.surveyGuid = null;
                }
            }
        });

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }



    homeClick() {
        this.router.navigate([`/surveygroup/${this.surveyGuid}`]);
    }


    mergeRouteParams(router: Router): { [key: string]: string } {
        let params = {};
        let route = router.routerState.snapshot.root;
        do {
            params = { ...params, ...route.params };
            route = route.firstChild;
        } while (route);

        return params;
    }
}