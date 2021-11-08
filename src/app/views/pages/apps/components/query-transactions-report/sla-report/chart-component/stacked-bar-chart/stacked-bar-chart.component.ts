import {AfterViewInit, Component, HostListener, Input, OnInit} from '@angular/core';
import {Chart} from 'angular-highcharts';
import {Options, SeriesOptionsType} from 'highcharts';
import * as HighCharts from 'highcharts/highstock';
import {SeriesStackedBarChart} from '../../../model/sla-report.model';

@Component({
	selector: 'kt-stacked-bar-chart',
	templateUrl: './stacked-bar-chart.component.html',
	styleUrls: ['./stacked-bar-chart.component.scss', '../../sla-report.component.scss']
})
export class StackedBarChartComponent implements OnInit, AfterViewInit {

	@Input('title') title: string;
	@Input('idInput') id: string;
	@Input('categories') categories: string[];
	@Input('series') series: SeriesStackedBarChart;

	slaByCoCodeChart: Chart;
	slaCoCodeChartOptions: Options = {
		chart: {
			type: 'bar',
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			// height: '60%',
			// marginTop: 10,
			// marginBottom: 10
		},
		title: {
			text: ''
		},
		credits: {
			enabled: false
		},
		xAxis: {
			// type: 'category',
			min: 0,
			max: 4,
			scrollbar: {
				enabled: true
			},
			// categories: ['CN1', 'CN2', 'CN3', 'CN4', 'CN5', 'CN6', 'CN7', 'CN8', 'CN9', 'CN10']
			// categories: this.categories
		},
		legend: {
			enabled: true
		},
		plotOptions: {
			bar: {
				stacking: 'normal',
				dataLabels: {
					enabled: true,
					formatter: function() {
						return this.y == 0 ? '' : this.y;
					}
				}
			}
		},
		colors: ['#A7A9AC', '#F2A629', '#D71424'],
		series: [
			// {
			// 	type: 'bar',
			// 	name: 'Trọng hạn SLA',
			// 	data: [5, 3, 4, 7, 2, 3, 4, 5, 1, 2, 3]
			// },
			// {
			// 	type: 'bar',
			// 	name: 'Sắp vượt SLA',
			// 	data: [5, 3, 4, 7, 2, 3, 4, 5, 1, 2, 3]
			// },
			// {
			// 	type: 'bar',
			// 	name: 'Vượt SLA',
			// 	data: [5, 3, 4, 7, 2, 3, 4, 5, 1, 2, 3]
			// }
		]
	};

	@HostListener('window:resize', ['$event'])
	onResize(event?) {
		this.reloadChart();
	}

	constructor() {
		this.slaByCoCodeChart = new Chart();
	}

	ngOnInit() {
	}

	ngAfterViewInit(): void {
		this.slaByCoCodeChart.ref = HighCharts.chart(this.id, this.slaCoCodeChartOptions);
		this.slaByCoCodeChart.ref.series = [];
	}

	reloadChart(): void {
		setTimeout(() => {
			this.slaCoCodeChartOptions.xAxis = {
				// type: 'category',
				min: 0,
				max: 2,
				scrollbar: {
					enabled: true
				},
				categories: this.categories
			};
			this.slaByCoCodeChart.ref = HighCharts.chart(this.id, this.slaCoCodeChartOptions);
			this.slaByCoCodeChart.ref.series = [];
			//
			this.slaByCoCodeChart.ref.addSeries(this.loadSeriesInSLA());
			this.slaByCoCodeChart.ref.addSeries(this.loadSeriesHalfOverSLA());
			this.slaByCoCodeChart.ref.addSeries(this.loadSeriesOverSLA());
		}, 200);
	}

	loadSeriesInSLA(): SeriesOptionsType {
		return {
			type: 'bar',
			name: 'Trong hạn SLA',
			data: this.series.inSla
		};
	}

	loadSeriesOverSLA(): SeriesOptionsType {
		return {
			type: 'bar',
			name: 'Vượt SLA',
			data: this.series.overSla
		};
	}

	loadSeriesHalfOverSLA(): SeriesOptionsType {
		return {
			type: 'bar',
			name: 'Sắp vượt SLA',
			data: this.series.halfOverSla
		};
	}

}
