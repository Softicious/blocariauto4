import { Component, OnInit, Input } from '@angular/core';
import { ModalController, IonSlides } from '@ionic/angular';

import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-solicitari-blocari-auto-list-filters',
	templateUrl: './solicitari-blocari-auto-list-filters.page.html',
	styleUrls: ['./solicitari-blocari-auto-list-filters.page.scss'],
})
export class SolicitariBlocariAutoListFiltersPage implements OnInit {
	@Input() catId: number = -1;
	@Input() modId: number = -1;
	@Input() nrAuto: string = '';

	form: FormGroup;

	listFilters: any = [
		{
			id: -1,
			name: 'Toate'
		},
		{
			id: 1,
			name: 'Neprealuate/Noi'
		},
		{
			id: 2,
			name: 'In asteptare Raspuns'
		},
		{
			id: 3,
			name: 'In curs de Blocare/Deblocare'
		},
		{
			id: 4,
			name: 'Blocat/Deblocat'
		},
		{
			id: 5,
			name: 'Tarif Achitat'
		},
		{
			id: 6,
			name: 'Inchis'
		},
		{
			id: 7,
			name: 'Anulat'
		}
	]

	listModes: any = [
		{
			id: -1,
			name: 'Toate'
		},
		{
			id: 2,
			name: 'Necesita Atentie'
		},
		{
			id: 3,
			name: 'Programate pentru Blocare'
		},
		{
			id: 4,
			name: 'Programate pentru Deblocare'
		},
		{
			id: 5,
			name: 'Solicitarile mele'
		}
	]

	constructor(private modalController: ModalController) {
		this.form = new FormGroup({
			nr_auto: new FormControl(this.nrAuto, Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(15),
			]))
		})
	}

	ngOnInit() {

		if (this.nrAuto !== '')
			this.form.patchValue({
				nr_auto: this.nrAuto
			})
	}

	dismiss() {
		this.modalController.dismiss({ catId: this.catId, modId: this.modId, nrAuto: this.form.value.nr_auto });
	}

	updateCategory(index) {
		this.catId = index
	}

	updateMode(index) {
		this.modId = index
	}

	reset() {
		this.catId = -1
		this.modId = -1
		this.nrAuto = ''
		this.form.patchValue({
			nr_auto: ''
		})
		this.dismiss()
	}

}
