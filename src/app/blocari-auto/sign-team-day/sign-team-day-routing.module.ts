import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignTeamDayPage } from './sign-team-day.page';

const routes: Routes = [
  {
    path: '',
    component: SignTeamDayPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignTeamDayPageRoutingModule {}
