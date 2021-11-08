// Angular
import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
// Layout
import {LayoutConfigService, ToggleOptions} from '../../../core/_base/layout';
import {HtmlClassService} from '../html-class.service';
import {Router} from '@angular/router';

@Component({
	selector: 'kt-brand',
	templateUrl: './brand.component.html',
	styleUrls: ['./brand.component.scss'],
})
export class BrandComponent implements OnInit, AfterViewInit {
	// Public properties
	headerLogo: string;
	headerStickyLogo: string;

	@Input('show') showIden: boolean;

	toggleOptions: ToggleOptions = {
		target: 'body',
		targetState: 'kt-aside--minimize',
		togglerState: 'kt-aside__brand-aside-toggler--active'
	};

	//showVar = true;

	/**
	 * Component constructor
	 *
	 * @param layoutConfigService: LayoutConfigService
	 * @param htmlClassService: HtmlClassService
	 */
	constructor(
		public layoutConfigService: LayoutConfigService,
		public htmlClassService: HtmlClassService,
		private router: Router
	) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		this.headerLogo = this.layoutConfigService.getLogo();
		this.headerStickyLogo = this.layoutConfigService.getStickyLogo();
	}

	/**
	 * On after view init
	 */
	ngAfterViewInit(): void {
	}

	toggleChild() {
		this.layoutConfigService.showVar.next(!this.layoutConfigService.showVar.getValue());
		let menuAsideClassMinimize = document.body.classList.contains('kt-aside--minimize');
		if (menuAsideClassMinimize) {
			this.layoutConfigService.isMenuMinimize.next(true);
		} else {
			this.layoutConfigService.isMenuMinimize.next(false);
		}
		//this.showVar = !this.showVar;
	}

	identifyCust(): void {
		this.router.navigate(['/pages/identify']).then();
	}
}
