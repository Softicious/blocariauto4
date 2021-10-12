import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitariBlocariAutoListPage } from './solicitari-blocari-auto-list.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitariBlocariAutoListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitariBlocariAutoListPageRoutingModule {}
