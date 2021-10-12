import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfilePasswordPage } from './profile-password.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePasswordPageRoutingModule {}
