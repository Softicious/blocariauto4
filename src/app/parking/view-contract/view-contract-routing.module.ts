import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewContractPage } from './view-contract.page';

const routes: Routes = [
  {
    path: '',
    component: ViewContractPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewContractPageRoutingModule {}
