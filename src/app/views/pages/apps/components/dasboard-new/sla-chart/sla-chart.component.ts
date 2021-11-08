import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subscription} from "rxjs";
import {Chart} from "angular-highcharts";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LangChangeEvent, TranslateService} from "@ngx-translate/core";
import {LocalStorageService, SessionStorageService} from "ngx-webstorage";
import {CommonService} from "../../../../../common-service/common.service";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {NgbPaginationConfig} from "@ng-bootstrap/ng-bootstrap";
import {DatePipe} from "@angular/common";
import {ProductTypePipe} from "../../../../../../core/_base/layout/pipes/product.pipe";
import {ComboTypePipe} from "../../../../../../core/_base/layout/pipes/combo-type.pipe";
import {StatusPipe} from "../../../../../../core/_base/layout/pipes/status.pipe";
import {CACHE_CO_CODE, DELETED, USERNAME_CACHED} from "../../../../../../shared/util/constant";
import * as Highcharts from "highcharts";
import {Options, SeriesOptionsType} from "highcharts";
declare var $: any;

@Component({
  selector: 'kt-sla-chart',
  templateUrl: './sla-chart.component.html',
  styleUrls: ['./sla-chart.component.scss']
})
export class SlaChartComponent implements OnInit, OnDestroy {
	circleData: any = [];
	@Input()  transaction= new BehaviorSubject<any>([]);
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	rateCompletionSLAChart: Chart = new Chart();

	accessRightIds: string[];
	inputtable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	authorisable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	username: string;

	listCombo: any = [];
	listSms: any = [];
	listCard: any = [];
	listAccount: any = [];
	listCustomer: any = [];
	listEBank: any = [];

	totalTransactionByTypeUser: number;

	numberOfTransactionsReachedSLA: number = 0;

	ratioReachedSLA: number = 0;

	circlePro = [
		{name: 'Vượt SLA', color: '#d61817', textColor: 'white', id: 1},
		{name: 'Đúng SLA', color: '#E8E8E8', textColor: 'black', id: 2},
	];

	enableCircleDataLabel: boolean = true;
	browserLang: string;

	data: any;

	searchForm: FormGroup;
	coCode: string;

	today = new Date();
	totalTrans: number;

	sub: Subscription;

@HostListener('window:resize', ['$event'])
	onResize(event?) {
		this.getCircleChartData();
	}

	constructor(public translate: TranslateService,
		private localStorage: LocalStorageService,
		private sessionStorage: SessionStorageService,
		private fb: FormBuilder,
		public commonService: CommonService,
		private toastService: ToastrService,
		private router: Router,
		private config: NgbPaginationConfig,
		private datePipe: DatePipe,
		private productTypePipe: ProductTypePipe,
		private comboTypePipe: ComboTypePipe,
		private statusPipe: StatusPipe) {

		config.size = 'sm';
		config.boundaryLinks = true;
		this.browserLang = translate.getBrowserLang();
		this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
			this.browserLang = event.lang;
		});

		this.accessRightIds = this.commonService.getRightIdsByUrl(this.router.url);

		this.username = this.localStorage.retrieve(USERNAME_CACHED);
		// console.log("TRANSACTION===========", this.transactions)

	}

	ngOnInit() {

	this.transaction.subscribe( i => {
		if(i.length > 0){
			console.clear()
			console.log("TRANSACTION===========", this.transaction.getValue())
			this.checkRight();
			this.sub = this.commonService.groupOwner$.subscribe(res => {
				if (res) {
					this.searchForm.controls.coCode.setValue(res);
					this.localStorage.store(CACHE_CO_CODE, res);
					// this.getAllData();
				}
			});

			this.calculateSlaIndex();
			// this.pushDataToArray();
			this.initAllChart();


			// this.pushDataToArray();
			//--- init chart after load all data
			$(document).ready(() => {
				this.initAllChart();
			});


			// this.cachedData();
			this.translate.onLangChange.subscribe(() => {
				this.rateCompletionSLAChart = new Chart();
				this.rateCompletionSLAChart.ref = Highcharts.chart('rateCompletionSLAChart', this.buildRateCompletionSLAOptions());
				this.reloadAllChart();
				this.getCircleChartData();

			});
		}
	})

	}

	checkRight(): void {
		console.log(this.accessRightIds, 'rights');
		if (this.accessRightIds.includes('I')) {
		this.inputtable$.next(true);
	}
	if (this.accessRightIds.includes('A')) {
		this.authorisable$.next(true);
	}
}

	ngOnDestroy() {
		this.commonService.isDisplayNotice$.next(false);
		this.sub.unsubscribe();
	}

	/**
	 * Init chart
	 */
	initChart(): void {
		this.rateCompletionSLAChart.ref = Highcharts.chart('rateCompletionSLAChart', this.buildRateCompletionSLAOptions());

	}




	/**
	 * Build option rate completion SLA
	 */
	buildRateCompletionSLAOptions(): Options {
		return {
			chart: {
				type: 'pie',
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false
			},
			lang: {
				noData: this.translate.instant('FINANCIAL.message.chartNoData'),
				loading: this.translate.instant('FINANCIAL.message.chartLoading')
			},
			title: {text: ''},
			legend: {
				enabled: false
			},
			credits: {
				enabled: false
			},
			tooltip: {
				enabled: true,
				followPointer: true,
				className: this.translate.currentLang,
				pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>',
				formatter: function (tooltip) {
					if (tooltip.options.className === 'vn' && this.color == '#ddd') {
						return 'Không có dữ liệu để hiển thị';
					} else if (tooltip.options.className === 'en' && this.color == '#ddd') {
						return 'No data to display';
					}
					let t = tooltip.options.className === 'vn' ? 'Tỷ trọng: ' : 'Proportion: ';
					let val = this.point.y.toFixed(2);
					return '<b>' + this.key + '</b><br>' + t + val + '%';
				}
			},
			plotOptions: {
				pie: {
					dataLabels: {
						enabled: true,
						formatter: function () {
							return this.color == '#ddd' ? '' : this.percentage + '%';
						},
						distance: -30,
						filter: {
							property: 'percentage',
							operator: '>',
							value: 2
						}
					},
					allowPointSelect: true,
					cursor: 'pointer',
					innerSize: '50%',
					point: {
						events: {
							legendItemClick: function (e) {
								e.preventDefault();
							},
							// mouseOver: function(e) {
							// 	$('#btn-' + this.index).addClass('sb-box-shadow');
							// 	$('#td-' + this.index).addClass('sb-label-hover');
							// }
						}
					},

				}
			},
			series: [],
		};
	}

	getCircleChartData() {
		if (this.rateCompletionSLAChart.ref.series.length > 0) {
			this.rateCompletionSLAChart.ref.series[0].remove();
		}

		let data = this.circleData.map(x => {
			let jar = this.circlePro.find(s => s.id === x.id);
			return {
				nameCustom: '',
				name: x.type,
				custom: {title: 'FINANCIAL.title.' + jar.name},
				// className: 'six-jar-legend',
				color: jar.color,
				textColor: jar.textColor,
				y: Number(x.percent),
			};
		});

		if (data && data.length < 1) {
			this.rateCompletionSLAChart.ref.series = [];
			return;
		}

		if (data.filter(x => x.y > 0).length === 0) {
			this.enableCircleDataLabel = true;
			data.push({
				nameCustom: null,
				name: null,
				textColor: null,
				custom: null,
				// className: 'six-jar-legend-hide',
				color: '#ddd',
				y: 100,
			});
		}
		// this.circleData = data;
		this.rateCompletionSLAChart.ref.addSeries({
			type: 'pie',
			name: this.translate.instant('FINANCIAL.label.proportion'),
			data: data,
			// color: 'red',
			custom: {
				title: 'FINANCIAL.label.proportion',
				text: ' '
			}
		});
	}

	/**
	 * Reload legend chart
	 */
	reloadLegend(chart: Chart) {
		for (let i = 0; i < chart.ref.series.length; i++) {
			let o = chart.ref.series[i].options;
			try {
				o.name = o.custom.text != undefined ? this.translate.instant(o.className) + o.custom.text : this.translate.instant(o.className);
			} catch (e) {
				// console.error(e);
			}
			chart.ref.series[i].update(o);
		}
	}

	/* Update all chart
	*/
	reloadAllChart() {

		this.reloadLegend(this.rateCompletionSLAChart);
		this.reloadPieChart(this.rateCompletionSLAChart);

		let op = this.buildRateCompletionSLAOptions();

		this.rateCompletionSLAChart.ref.update(op, true);
	}


	/**
	 * Update pie chart
	 */
	reloadPieChart(chart: Chart) {
		if (!chart || !chart.ref || !chart.ref.series || chart.ref.series.length < 1) {
			this.rateCompletionSLAChart.ref.series = [];
			return;
		}
		chart.ref.series[0].points.forEach(p => {
			p.options.name = this.translate.instant(p.options.custom.title);
		});
		chart.ref.series[0].options.name = this.translate.instant(chart.ref.series[0].options.custom.title);
		chart.ref.series[0].update(chart.ref.series[0].options);
	}

	/**
	 * Clear chart before init
	 */
	clearChart(charts: Chart[]) {
		charts.forEach(c => {
			while (c.ref.series.length) {
				c.ref.series[0].remove();
			}
		});
	}

	chartHover(index: number) {
		if (this.rateCompletionSLAChart && this.rateCompletionSLAChart.ref.series.length > 0) {
			this.rateCompletionSLAChart.ref.series[0].points[index].onMouseOver();
		}
	}

	onMouseOver(index: number) {
		$('#table-chart button').removeClass('sb-box-shadow');
		$('#table-chart').removeClass('sb-label-hover');
		$('#btn-' + index).addClass('sb-box-shadow');
		$('#td-' + index).addClass('sb-label-hover');
		if (this.rateCompletionSLAChart && this.rateCompletionSLAChart.ref.series.length > 0) {
			this.rateCompletionSLAChart.ref.series[0].points[index].onMouseOver();
		}
	}

	onMouseOut() {
		$('#table-chart button').removeClass('sb-box-shadow');
		$('#table-chart').removeClass('sb-label-hover');
	}


	initAllChart() {
		this.initChart();
		// this.getData();
		this.getCircleChartData();
		this.reloadLegend(this.rateCompletionSLAChart);
	}


	calculateSlaIndex() {
		// this.listCombo = this.transactions.listCombo ? this.transactions.listCombo : [];
		// this.listSms = this.transactions.listSms ? this.transactions.listSms : [];
		// this.listCard = this.transactions.listCard ? this.transactions.listCard : [];
		// this.listAccount = this.transactions.listAccount ? this.transactions.listAccount : [];
		// this.listCustomer = this.transactions.listCustomer ? this.transactions.listCustomer : [];
		// this.listEBank = this.transactions.listEBank ? this.transactions.listEBank : [];

		if (this.accessRightIds.includes('I')) {
			this.classifySLAByInputter();
		}

		if (this.accessRightIds.includes('A')) {
			this.classifySLAByAuthoriser();

		}

		let calculateReachedRatioSLA = (this.numberOfTransactionsReachedSLA / this.getNumberOfExecutedTransactionOfUser()) * 100;
		this.ratioReachedSLA = Math.floor(calculateReachedRatioSLA);

		console.log("Tổng số giao dịch đạt chỉ số SLA ============>", this.numberOfTransactionsReachedSLA);
		console.log("Số lượng giao dịch đc thực hiện bởi user : ", this.username, this.getNumberOfExecutedTransactionOfUser());
		console.log("Tỉ lệ đạt chỉ số SLA ============>", this.ratioReachedSLA);

		this.circleData = this.getNumberOfExecutedTransactionOfUser() > 0 ? [
			{
				id: 1,
				type: "Vượt SLA",
				percent: 100 - this.ratioReachedSLA
			},
			{
				id: 2,
				type: "Đúng SLA",
				percent: this.ratioReachedSLA
			}
		] : [
			{
				id: 2,
				type: "không có dũ liệu",
				percent: 0
			},
		];
	}

	getNumberOfExecutedTransactionOfUser() {
		return this.listCombo.length + this.listSms.length + this.listCard.length
			+ this.listAccount.length + this.listCustomer.length + this.listEBank.length
	}

	classifySLAByInputter() {
		let slaCombo1 = 15 * 60000;
		let slaCombo2 = 15 * 60000;
		let slaCombo3 = 15 * 60000;
		let slaSupper = 15 * 60000;
		let slaCustomerInfo = 15 * 60000;
		let SPDV = 15 * 60000;


		if (this.listCombo != null && this.listCombo.length > 0) {
			this.listCombo.filter(c => c.inputter == this.username).forEach(i => {

				if (i.comboType == "COMBO3" || i.comboType == 'COMBO3_EX' && i.timeSlaInputter <= slaCombo3) {
					this.numberOfTransactionsReachedSLA++
				}

				if (i.comboType == "COMBO2" || i.comboType == 'COMBO2_EX' && i.timeSlaInputter <= slaCombo2) {
					this.numberOfTransactionsReachedSLA++
				}

				if (i.comboType == "COMBO1" || i.comboType == 'COMBO1_EX' && i.timeSlaInputter <= slaCombo1) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}

		if (this.listSms != null && this.listSms.length > 0) {
			this.listSms.filter(s => s.inputter == this.username).forEach(i => {
				if (i.timeSlaInputter <= SPDV) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}

		if (this.listCard != null && this.listCard.length > 0) {
			this.listCard.filter(s => s.inputter == this.username).forEach(i => {
				if (i.timeSlaInputter <= SPDV) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}

		if (this.listAccount != null && this.listAccount.length > 0) {
			this.listAccount.filter(s => s.inputter == this.username).forEach(i => {
				if (i.timeSlaInputter <= SPDV) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}

		if (this.listCustomer != null && this.listCustomer.length > 0) {
			this.listCustomer.filter(s => s.inputter == this.username).forEach(i => {
				if (i.timeSlaInputter <= slaCustomerInfo) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}

		if (this.listEBank != null && this.listEBank.length > 0) {
			this.listEBank.filter(s => s.inputter == this.username).forEach(i => {
				if (i.timeSlaInputter <= SPDV) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}
	}

	classifySLAByAuthoriser() {

		let slaCombo1 = 15 * 60000;
		let slaCombo2 = 15 * 60000;
		let slaCombo3 = 15 * 60000;
		let slaSupper = 15 * 60000;
		let slaCustomerInfo = 15 * 60000;
		let SPDV = 15 * 60000;


		if (this.listCombo != null && this.listCombo.length > 0) {
			this.listCombo.filter(c => c.authoriser == this.username).forEach(i => {

				if (i.comboType == "COMBO3" || i.comboType == 'COMBO3_EX' && i.timeSlaAuthorise <= slaCombo3) {
					this.numberOfTransactionsReachedSLA++
				}

				if (i.comboType == "COMBO2" || i.comboType == 'COMBO2_EX' && i.timeSlaAuthorise <= slaCombo2) {
					this.numberOfTransactionsReachedSLA++
				}

				if (i.comboType == "COMBO1" || i.comboType == 'COMBO1_EX' && i.timeSlaAuthorise <= slaCombo1) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}

		if (this.listSms != null && this.listSms.length > 0) {
			this.listSms.filter(s => s.authoriser == this.username).forEach(i => {
				if (i.timeSlaAuthorise <= SPDV) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}

		if (this.listCard != null && this.listCard.length > 0) {
			this.listCard.filter(s => s.authoriser == this.username).forEach(i => {
				if (i.timeSlaAuthorise <= SPDV) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}

		if (this.listAccount != null && this.listAccount.length > 0) {
			this.listAccount.filter(s => s.authoriser == this.username).forEach(i => {
				if (i.timeSlaAuthorise <= SPDV) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}

		if (this.listCustomer != null && this.listCustomer.length > 0) {
			this.listCustomer.filter(s => s.authoriser == this.username).forEach(i => {
				if (i.timeSlaAuthorise <= SPDV) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}

		if (this.listEBank != null && this.listEBank.length > 0) {
			this.listEBank.filter(s => s.authoriser == this.username).forEach(i => {
				if (i.timeSlaAuthorise <= SPDV) {
					this.numberOfTransactionsReachedSLA++
				}
			});
		}
	}
}

