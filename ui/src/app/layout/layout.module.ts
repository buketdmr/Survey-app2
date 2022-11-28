import { NgModule } from '@angular/core';

import { MainLayoutModule } from 'app/layout/components/main-layout/main-layout.module';

@NgModule({
    imports: [
        MainLayoutModule
    ],
    exports: [
        MainLayoutModule
    ]
})
export class LayoutModule
{
}
