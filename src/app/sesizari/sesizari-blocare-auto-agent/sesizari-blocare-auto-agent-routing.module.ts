import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SesizariBlocareAutoAgentPage } from './sesizari-blocare-auto-agent.page';

const routes: Routes = [
  {
    path: '',
    component: SesizariBlocareAutoAgentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SesizariBlocareAutoAgentPageRoutingModule {}
