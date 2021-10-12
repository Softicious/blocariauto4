import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePasswordPageRoutingModule } from './profile-password-routing.module';

import { ProfilePasswordPage } from './profile-password.page';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePasswordPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  declarations: [ProfilePasswordPage]
})
export class ProfilePasswordPageModule {}
