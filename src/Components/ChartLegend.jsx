import React from 'react';

const ChartLegend = React.createClass({
	getStyledOptions: function() {
		const categoryColors = ["#3366CC","#DC3912","#FF9900","#109618","#990099","#3B3EAC","#0099C6","#DD4477","#66AA00","#B82E2E","#316395","#994499","#22AA99","#AAAA11","#6633CC","#E67300","#8B0707","#329262","#5574A6","#3B3EAC"];


		var styledOptions =	this.props.pollOptions.map(function(option, i) {

			return (
				<div key={i} className='legend-item'>
					<div className='legend-color' style={{backgroundColor: categoryColors[i]}}></div>{option.name}
				</div>
			)
		})

		return (styledOptions)
	},
	render: function() {
		return (
			<div className='legend'>
				{this.getStyledOptions()}
			</div>
		)
	}
});

export default ChartLegend