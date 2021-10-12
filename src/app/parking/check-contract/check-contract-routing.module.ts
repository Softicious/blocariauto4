import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckContractPage } from './check-contract.page';

const routes: Routes = [
  {
    path: '',
    component: CheckContractPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckContractPageRoutingModule {}
