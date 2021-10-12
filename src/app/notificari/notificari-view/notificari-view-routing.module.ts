import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificariViewPage } from './notificari-view.page';

const routes: Routes = [
  {
    path: '',
    component: NotificariViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificariViewPageRoutingModule {}
