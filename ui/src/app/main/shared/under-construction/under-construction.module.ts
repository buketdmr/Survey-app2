import { UnderConstructionComponent } from './under-construction.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

const routes = [
    {
        path: 'under-construction',
        component: UnderConstructionComponent,
    },
];

@NgModule({
    declarations: [UnderConstructionComponent],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class UnderConstructionModule {}
