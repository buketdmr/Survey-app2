import { LoaderService } from './../../../services/loader.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.sass'],
})
export class LoadingComponent implements OnInit {
    loading: boolean;
    constructor(private loaderService: LoaderService) {
        this.loaderService.isLoading.subscribe((v) => {
            this.loading = v;
        });
    }
    ngOnInit(): void {}
}
