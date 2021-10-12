import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitariBlocariAutoViewPage } from './solicitari-blocari-auto-view.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitariBlocariAutoViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitariBlocariAutoViewPageRoutingModule {}
