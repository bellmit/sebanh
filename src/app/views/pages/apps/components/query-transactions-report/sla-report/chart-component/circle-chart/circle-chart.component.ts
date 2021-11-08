import {AfterViewInit, Component, HostListener, Input, OnInit} from '@angular/core';
import {Chart} from 'angular-highcharts';
import {default as HighCharts, Options, SeriesOptionsType} from 'highcharts';
import {QueryTransReportService} from '../../../query-trans-report.service';
import {SeriesCircleChart} from '../../../model/sla-report.model';

@Component({
	selector: 'kt-circle-chart',
	templateUrl: './circle-chart.component.html',
	styleUrls: ['./circle-chart.component.scss', '../../sla-report.component.scss']
})
export class CircleChartComponent implements OnInit, AfterViewInit {

	@Input('idInput') id: string;
	@Input('title') title: string;
	@Input('values') values: any[];
	@Input('serierBusiness') serierBusiness: SeriesCircleChart[];

	businessChart: Chart;
	business = this.service.business;
	// circle chart
	businessChartOptions: Options = {
		chart: {
			type: 'pipe',
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			height: '100%',
			marginTop: 10,
			marginBottom: 10
		},
		lang: {
			noData: 'Không có dữ liệu để hiển thị',
			loading: ''
		},
		title: {
			text: ''
		},
		legend: {
			enabled: false
		},
		credits: {
			enabled: false
		},
		tooltip: {
			enabled: true,
			pointFormat: '{series.name}: <b>{point.percentage:.0f}%</b>',
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					formatter: function() {
						return this.color == '#A7A9AC' ? '' : this.percentage.toFixed(0) + '%';
					},
					distance: -20,
					filter: {
						property: 'percentage',
						operator: '>',
						value: 2
					}
				},
				center: ['50%', '50%'],
				innerSize: '50%',
				size: '100%',
				color: '#A7A9AC'
			}
		},
		series: [
			{
				type: 'pie',
				name: 'Phần trăm',
				data: [
					{
						name: 'Không có dữ liệu',
						y: 100,
						color: '#A7A9AC'
					}
				]
			}
		]
	};

	@HostListener('window:resize', ['$event'])
	onResize(event?) {
		this.reloadChart();
	}

	constructor(
		private service: QueryTransReportService
	) {
		this.businessChart = new Chart();
	}

	ngOnInit() {
	}

	onMouseover(event, index) {
		const element = document.getElementById(`btn-${index}-${this.id}`);
		this.addClass(element, 'sb-box-shadow sb-label-hover');
		// element.className += 'sb-box-shadow sb-label-hover';
		if (this.businessChart && this.businessChart.ref.series.length > 0) {
			this.businessChart.ref.series[0].points[index].onMouseOver();
		}
	}

	onMouseout(event, index) {
		const element = document.getElementById(`btn-${index}-${this.id}`);
		this.removeClass(element, 'sb-box-shadow sb-label-hover');
	}

	addClass(element, className) {
		element.className += (' ' + className);
	}

	removeClass(element, className) {
		let str = ' ' + element.className + ' ';
		// console.log(str);
		element.className = str.replace(' ' + className + ' ', ' ').replace(/^\s+|\s+$/g, '');
	}

	reloadChart(): void {
		this.businessChart.ref = HighCharts.chart(this.id, this.businessChartOptions);
		this.businessChart.ref.series = [];
		setTimeout(() => {
			this.businessChart.ref.addSeries(this.loadData());
		}, 200);
	}

	loadData(): SeriesOptionsType {
		return {
			type: 'pie',
			name: 'Phần trăm',
			data: this.serierBusiness
		};
	}

	ngAfterViewInit(): void {
		this.businessChart.ref = HighCharts.chart(this.id, this.businessChartOptions);
		// this.businessChart.ref.series = [];
	}
}
