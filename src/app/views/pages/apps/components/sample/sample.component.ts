import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Component({
	templateUrl: './sample.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
	public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor() {

	}
	ngOnInit() {
		this.isLoading.next(true);
	}
}
