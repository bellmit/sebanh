import {AfterViewInit, Component, HostListener, Input, OnInit} from '@angular/core';
import * as HighCharts from 'highcharts';
import {Chart} from 'angular-highcharts';
import {Options} from 'highcharts';
import {SeriesStackedBarChart} from '../../../model/sla-report.model';
import {SeriesOptionsType} from 'highcharts';

@Component({
	selector: 'kt-stacked-column-chart',
	templateUrl: './stacked-column-chart.component.html',
	styleUrls: ['./stacked-column-chart.component.scss', '../../sla-report.component.scss']
})
export class StackedColumnChartComponent implements OnInit, AfterViewInit {

	@Input('idInput') id: string;
	@Input('categories') categories: string[];
	@Input('series') series: SeriesStackedBarChart;

	slaByBusinessChart: Chart;
	slaBusinessChartOptions: Options = {
		chart: {
			type: 'column',
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
			categories: []
		},
		yAxis: {
			min: 0,
			title: {
				text: ''
			},
			stackLabels: {
				enabled: false,
				style: {
					fontWeight: 'bold'
				}
			}
		},
		legend: {
			enabled: true
		},
		plotOptions: {
			column: {
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
			// 	type: 'column',
			// 	name: 'Trong hạn SLA',
			// 	data: [5, 3, 4, 7, 2]
			// },
			// {
			// 	type: 'column',
			// 	name: 'Sắp vượt SLA',
			// 	data: [2, 2, 3, 2, 1]
			// },
			// {
			// 	type: 'column',
			// 	name: 'Vượt SLA',
			// 	data: [3, 4, 4, 2, 5]
			// }
		]
	};

	@HostListener('window:resize', ['$event'])
	onResize(event?) {
		this.reloadChart();
	}

	constructor() {
		this.slaByBusinessChart = new Chart();
	}

	ngOnInit() {
	}

	ngAfterViewInit(): void {
		// this.slaByBusinessChart.ref = HighCharts.chart(this.id, this.slaBusinessChartOptions);
	}

	reloadChart(): void {
		setTimeout(() => {
			this.slaBusinessChartOptions.xAxis = {
				categories: this.categories
			};
			this.slaByBusinessChart.ref = HighCharts.chart(this.id, this.slaBusinessChartOptions);
			this.slaByBusinessChart.ref.series = [];
			//
			this.slaByBusinessChart.ref.addSeries(this.loadSeriesInSLA());
			this.slaByBusinessChart.ref.addSeries(this.loadSeriesHalfOverSLA());
			this.slaByBusinessChart.ref.addSeries(this.loadSeriesOverSLA());
		}, 200);
	}

	loadSeriesInSLA(): SeriesOptionsType {
		return {
			type: 'column',
			name: 'Trong hạn SLA',
			data: this.series.inSla
		};
	}

	loadSeriesOverSLA(): SeriesOptionsType {
		return {
			type: 'column',
			name: 'Vượt SLA',
			data: this.series.overSla
		};
	}

	loadSeriesHalfOverSLA(): SeriesOptionsType {
		return {
			type: 'column',
			name: 'Sắp vượt SLA',
			data: this.series.halfOverSla
		};
	}

}
