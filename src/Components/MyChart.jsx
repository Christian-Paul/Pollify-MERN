import Chart from 'chart.js'
import { Doughnut as DoughnutChart } from 'react-chartjs';
import React from 'react';

Chart.defaults.global.responsive = true;

var MyChart = React.createClass({
	render: function() {
		const categoryColors = ["#3366CC","#DC3912","#FF9900","#109618","#990099","#3B3EAC","#0099C6","#DD4477","#66AA00","#B82E2E","#316395","#994499","#22AA99","#AAAA11","#6633CC","#E67300","#8B0707","#329262","#5574A6","#3B3EAC"];

		var chartData = this.props.pollOptions.map(function(item, i) {
			return {
				color: categoryColors[i],
				label: item.name,
				value: item.votes
			}
		});

		var tempData = [
			{
				color: '#000',
				label: 'black',
				value: 200
			},
			{
				color: '#FFF',
				label: 'white',
				value: 211
			}
		]

		return <DoughnutChart data={chartData} width='400' height='400' />
	}
});

export default MyChart