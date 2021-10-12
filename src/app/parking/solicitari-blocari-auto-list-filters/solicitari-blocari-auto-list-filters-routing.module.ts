import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitariBlocariAutoListFiltersPage } from './solicitari-blocari-auto-list-filters.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitariBlocariAutoListFiltersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitariBlocariAutoListFiltersPageRoutingModule {}
