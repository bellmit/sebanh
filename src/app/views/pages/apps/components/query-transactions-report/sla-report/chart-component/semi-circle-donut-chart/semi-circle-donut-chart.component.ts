import {Component, HostListener, Input, OnInit} from '@angular/core';
import {Chart} from 'angular-highcharts';
import {default as HighCharts, Options, SeriesOptionsType} from 'highcharts';

@Component({
	selector: 'kt-semi-circle-donut-chart',
	templateUrl: './semi-circle-donut-chart.component.html',
	styleUrls: ['./semi-circle-donut-chart.component.scss', '../../sla-report.component.scss']
})
export class SemiCircleDonutChartComponent implements OnInit {

	@Input('totalTrans') totalTrans: number;
	@Input('overSla') overSla: number;
	@Input('halfOver') halfOver: number;

	totalChart: Chart;
	overSlaChart: Chart;
	underSlaChart: Chart;

	// semi circle donut chart
	chartOptions: Options = {
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
			text: '',
			verticalAlign: 'middle',
			align: 'center',
		},
		legend: {
			enabled: false
		},
		credits: {
			enabled: false
		},
		tooltip: {
			enabled: false
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: false
				},
				startAngle: -90,
				endAngle: 90,
				center: ['50%', '50%'],
				innerSize: '50%',
				size: '100%',
				color: '#A7A9AC'
			}
		},
		series: [
			{
				type: 'pie',
				name: '',
				data: [
					{
						name: 'Không có dữ liệu hiển thị',
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

	constructor() {
		this.totalChart = new Chart();
		this.overSlaChart = new Chart();
		this.underSlaChart = new Chart();
	}

	ngOnInit() {
		this.totalChart.ref = HighCharts.chart('total-trans', this.chartOptions);
		this.overSlaChart.ref = HighCharts.chart('over-sla', this.chartOptions);
		this.underSlaChart.ref = HighCharts.chart('under-sla', this.chartOptions);

		this.totalChart.ref.series = [];
		this.overSlaChart.ref.series = [];
		this.underSlaChart.ref.series = [];
	}

	reloadChart(): void {
		this.totalChart.ref = HighCharts.chart('total-trans', this.chartOptions);
		this.overSlaChart.ref = HighCharts.chart('over-sla', this.chartOptions);
		this.underSlaChart.ref = HighCharts.chart('under-sla', this.chartOptions);
		setTimeout(() => {
			this.totalChart.ref.addSeries(this.reloadCircleTotalTrans());
			this.overSlaChart.ref.addSeries(this.reloadOverSlaChart());
			this.underSlaChart.ref.addSeries(this.reloadHalfOverChart());
			const overSla = Math.round((this.overSla / this.totalTrans) * 100);
			const halfOver = Math.round((this.halfOver / this.totalTrans) * 100);

			this.overSlaChart.ref.title.update({
				text: overSla ? `${overSla}%` : ''
			});
			this.underSlaChart.ref.title.update({
				text: halfOver ? `${halfOver}%` : ''
			});
		}, 200);

		// this.totalChart.ref.series = [];
		// this.overSlaChart.ref.series = [];
		// this.underSlaChart.ref.series = [];
	}

	reloadOverSlaChart(): SeriesOptionsType {
		if (this.overSla == this.totalTrans) {
			return {
				type: 'pie',
				data: [
					{
						name: '',
						y: this.overSla,
						color: '#D71424'
					}
				]
			};
		} else {
			return {
				type: 'pie',
				data: [
					{
						name: '',
						y: this.overSla,
						color: '#D71424'
					},
					{
						name: null,
						y: this.totalTrans,
						color: '#A7A9AC'
					}
				]
			};
		}
	}

	reloadCircleTotalTrans(): SeriesOptionsType {
		return {
			type: 'pie',
			data: [
				{
					name: null,
					y: this.totalTrans,
					color: '#A7A9AC'
				}
			]
		};
	}

	reloadHalfOverChart(): SeriesOptionsType {
		if (this.halfOver == this.totalTrans) {
			return {
				type: 'pie',
				data: [
					{
						name: null,
						y: this.halfOver,
						color: '#4AC30A'
					}
				]
			};
		} else {
			return {
				type: 'pie',
				data: [
					{
						name: null,
						y: this.halfOver,
						color: '#4AC30A'
					},
					{
						name: null,
						y: this.totalTrans,
						color: '#A7A9AC'
					}
				]
			};
		}
	}

}
