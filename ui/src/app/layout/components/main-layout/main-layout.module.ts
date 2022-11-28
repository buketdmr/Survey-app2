import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';

import { FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';

import { ContentModule } from 'app/layout/components/content/content.module';
import { FooterModule } from 'app/layout/components/footer/footer.module';

import { MainLayoutComponent } from 'app/layout/components/main-layout/main-layout.component';
import { NavbarModule } from '../navbar/navbar.module';

@NgModule({
    declarations: [
        MainLayoutComponent
    ],
    imports     : [
        MatSidenavModule,

        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        ContentModule,
        FooterModule,
        NavbarModule
    ],
    exports     : [
        MainLayoutComponent
    ]
})
export class MainLayoutModule
{
}
