import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolicitariBlocariAutoListFiltersPageRoutingModule } from './solicitari-blocari-auto-list-filters-routing.module';

import { SolicitariBlocariAutoListFiltersPage } from './solicitari-blocari-auto-list-filters.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitariBlocariAutoListFiltersPageRoutingModule,
    FontAwesomeModule,
    ReactiveFormsModule
  ],
  declarations: [SolicitariBlocariAutoListFiltersPage]
})
export class SolicitariBlocariAutoListFiltersPageModule {}
