import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificariListPage } from './notificari-list.page';

const routes: Routes = [
  {
    path: '',
    component: NotificariListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificariListPageRoutingModule {}
