import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnInit,
	Renderer2,
	ViewChild
} from '@angular/core';
import {filter} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';
import * as objectPath from 'object-path';
// Layout
import {LayoutConfigService, MenuAsideService, MenuOptions, OffcanvasOptions} from '../../../core/_base/layout';
import {HtmlClassService} from '../html-class.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalContactComponent} from '../../pages/apps/components/modal-contact/modal-contact.component';
import {EXTERNAL_LINK, MAP_USER_MATRIX_CACHE} from '../../../shared/util/constant';
import {AppConfigService} from '../../../app-config.service';
import {SessionStorageService} from 'ngx-webstorage';
import {BehaviorSubject} from 'rxjs';
import {SignatureService} from '../../pages/apps/components/identify-customer/service/signature.service';
import {CoreAiService} from '../../pages/apps/components/identify-customer/service/core-ai.service';

declare var $: any;

@Component({
	selector: 'kt-aside-left',
	templateUrl: './aside-left.component.html',
	styleUrls: ['./aside-left.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsideLeftComponent implements OnInit, AfterViewInit {

	@ViewChild('asideMenu', {static: true}) asideMenu: ElementRef;
	userMatrix: {
		function_id: string;
		function_name: string;
		right_id: string;
	}[] = [];

	currentRouteUrl = '';
	insideTm: any;
	outsideTm: any;
	imagePath: string;

	menuCanvasOptions: OffcanvasOptions = {
		baseClass: 'kt-aside',
		overlay: true,
		closeBy: 'kt_aside_close_btn',
		toggleBy: {
			target: 'kt_aside_mobile_toggler',
			state: 'kt-header-mobile__toolbar-toggler--active'
		}
	};

	menuOptions: MenuOptions = {
		// vertical scroll
		scroll: null,

		// submenu setup
		submenu: {
			desktop: {
				// by default the menu mode set to accordion in desktop mode
				default: 'dropdown',
			},
			tablet: 'accordion', // menu set to accordion in tablet mode
			mobile: 'accordion' // menu set to accordion in mobile mode
		},

		// accordion setup
		accordion: {
			expandAll: false // allow having multiple expanded accordions in the menu
		}
	};
	hiddenAuth$ = new BehaviorSubject<boolean>(false);


	/**
	 * Component constructor
	 * @param htmlClassService
	 * @param menuAsideService
	 * @param layoutConfigService
	 * @param router
	 * @param render
	 * @param cdr
	 * @param modalService
	 * @param appConfigService
	 * @param sessionStorageService
	 * @param commonService
	 */
	constructor(
		public htmlClassService: HtmlClassService,
		public menuAsideService: MenuAsideService,
		public layoutConfigService: LayoutConfigService,
		public router: Router,
		private render: Renderer2,
		private cdr: ChangeDetectorRef,
		private modalService: NgbModal,
		private appConfigService: AppConfigService,
		private sessionStorageService: SessionStorageService,
		public signatureService: SignatureService,
		private coreAiService: CoreAiService
	) {
		this.userMatrix = this.sessionStorageService.retrieve(MAP_USER_MATRIX_CACHE);
	}

	ngAfterViewInit(): void {
	}

	ngOnInit() {
		const right = this.userMatrix.find(ele => ele.function_id == 'pages/dashboard').right_id;
		if (right == 'I') {
			this.hiddenAuth$.next(true);
		}
		this.currentRouteUrl = this.router.url.split(/[?#]/)[0];

		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(event => {
				this.currentRouteUrl = this.router.url.split(/[?#]/)[0];
				this.cdr.markForCheck();
			});

		const config = this.layoutConfigService.getConfig();

		if (objectPath.get(config, 'aside.menu.dropdown')) {
			this.render.setAttribute(this.asideMenu.nativeElement, 'data-ktmenu-dropdown', '1');
			// tslint:disable-next-line:max-line-length
			this.render.setAttribute(this.asideMenu.nativeElement, 'data-ktmenu-dropdown-timeout', objectPath.get(config, 'aside.menu.submenu.dropdown.hover-timeout'));
		}
	}

	/**
	 * Check Menu is active
	 * @param item: any
	 */
	isMenuItemIsActive(item): boolean {
		if (item.submenu) {
			return this.isMenuRootItemIsActive(item);
		}

		if (!item.page) {
			return false;
		}

		return this.currentRouteUrl.indexOf(item.page) !== -1;
	}

	/**
	 * Check Menu Root Item is active
	 * @param item: any
	 */
	isMenuRootItemIsActive(item): boolean {
		let result = false;

		for (const subItem of item.submenu) {
			result = this.isMenuItemIsActive(subItem);
			if (result) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Use for fixed left aside menu, to onChangeNationalVal menu on mouseenter event.
	 * @param e Event
	 */
	mouseEnter(e: Event) {
		// check if the left aside menu is fixed
		if (document.body.classList.contains('kt-aside--fixed')) {
			if (this.outsideTm) {
				clearTimeout(this.outsideTm);
				this.outsideTm = null;
			}

			this.insideTm = setTimeout(() => {
				//this.layoutConfigService.showVar.next(!this.layoutConfigService.showVar.getValue());

				/// if the left aside menu is minimized
				if (document.body.classList.contains('kt-aside--minimize') && KTUtil.isInResponsiveRange('desktop')) {
					//this.layoutConfigService.showVar.next(false);
					// onChangeNationalVal the left aside menu
					this.render.removeClass(document.body, 'kt-aside--minimize');
					this.render.addClass(document.body, 'kt-aside--minimize-hover');
				}
			}, 50);
		}
	}

	/**
	 * Use for fixed left aside menu, to onChangeNationalVal menu on mouseenter event.
	 * @param e Event
	 */
	mouseLeave(e: Event) {
		if (document.body.classList.contains('kt-aside--fixed')) {
			if (this.insideTm) {
				clearTimeout(this.insideTm);
				this.insideTm = null;
			}

			this.outsideTm = setTimeout(() => {
				// if the left aside menu is expand
				if (document.body.classList.contains('kt-aside--minimize-hover') && KTUtil.isInResponsiveRange('desktop')) {
					// hide back the left aside menu
					this.render.removeClass(document.body, 'kt-aside--minimize-hover');
					this.render.addClass(document.body, 'kt-aside--minimize');
				}
			}, 100);
		}
	}

	/**
	 * Returns Submenu CSS Class Name
	 * @param item: any
	 */
	getItemCssClasses(item) {
		let classes = 'kt-menu__item';

		if (objectPath.get(item, 'submenu')) {
			classes += ' kt-menu__item--submenu';
		}

		if (!item.submenu && this.isMenuItemIsActive(item)) {
			classes += ' kt-menu__item--active kt-menu__item--here';
		}

		if (item.submenu && this.isMenuItemIsActive(item)) {
			classes += ' kt-menu__item--open kt-menu__item--here';
		}

		// custom class for menu item
		// const customClass = objectPath.get(item, 'custom-class');
		// if (customClass) {
		// 	classes += ' ' + customClass;
		// }
		//
		// if (objectPath.get(item, 'icon-only')) {
		// 	classes += ' kt-menu__item--icon-only';
		// }

		return classes;
	}

	getItemAttrSubmenuToggle(item) {
		let toggle = 'hover';
		if (objectPath.get(item, 'toggle') === 'click') {
			toggle = 'click';
		} else if (objectPath.get(item, 'submenu.type') === 'tabs') {
			toggle = 'tabs';
		} else {
			// submenu toggle default to 'hover'
		}

		return toggle;
	}

	aler(event) {
		alert(event);
	}

	onClickMenu(link: string): void {
		switch (link) {
			case 'contact':
				this.modalService.dismissAll();
				this.modalService.open(ModalContactComponent, {centered: true, backdrop: 'static'});
				break;
			case EXTERNAL_LINK.OBIEE:
				window.open(this.appConfigService.getConfigByKey(EXTERNAL_LINK.OBIEE), '_blank');
				break;
			case EXTERNAL_LINK.CARDSM:
				window.open(this.appConfigService.getConfigByKey(EXTERNAL_LINK.CARDSM), '_blank');
				break;
			case EXTERNAL_LINK.CARDSUPPORT:
				window.open(this.appConfigService.getConfigByKey(EXTERNAL_LINK.CARDSUPPORT), '_blank');
				break;
			case EXTERNAL_LINK.CRM:
				window.open(this.appConfigService.getConfigByKey(EXTERNAL_LINK.CRM), '_blank');
				break;
			default:
				this.redirect(link);
		}
	}

	redirect(link: string) {
		const currentRouter = this.router.url;
		if (currentRouter == link) {
			return;
		}
		this.resetImagesOnAsideRight();
		this.router.navigate([link]);
	}

	resetImagesOnAsideRight(): void {
		this.signatureService.gtttUrlModel$.next(null);
		this.coreAiService.faceScan$.next(null);
		this.coreAiService.cardFrontScan$.next(null);
		this.coreAiService.cardBackScan$.next(null);
		this.coreAiService.fingerLeftScan$.next(null);
		this.coreAiService.fingerRightScan$.next(null);
		this.signatureService.verifySignature$.next(null);
	}

	getPathIcon(icon: string) {
		return './assets/media/icons/ic-trang-chu.svg';
	}

	checkShowMenu(menu) {
		if (menu.notShowAuth) {
			if (menu.submenu) {
				const right = this.userMatrix.find(matrix => matrix.function_id == 'pages/combo1');
				if (right && right.right_id == 'A') {
					return false;
				}
			} else {
				const right = this.userMatrix.find(matrix => matrix.function_id == menu.page.slice(1));
				if (right && right.right_id == 'A') {
					return false;
				}
			}
		}
		return menu.permission;
	}
}
