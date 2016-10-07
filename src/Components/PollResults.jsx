import { IndexLink } from 'react-router';
import React from 'react';

import ChartLegend from './ChartLegend.jsx';
import MyChart from './MyChart.jsx';

const PollResults = React.createClass({
	contextTypes: {
	  	router: React.PropTypes.object.isRequired
	},
	deletePoll: function() {
		// send request for server to delete poll
		var self = this;
	    $.ajax({
	        url: '/delete-poll?pollId=' + self.props.pollId,
	        success: function(response) {
				// redirect user to their polls
				self.context.router.push('/users/' + self.props.userId);
	        }
	    });
	},
	checkForVotes: function() {
		var options = this.props.pollOptions;

		for(var i = 0; i < options.length; i++) {
			if(options[i].votes > 0) {
				return true
			}
		}

		return false
	},
	render: function() {
		return (
			<div className='poll-results'>
				{
					(() => {
						if(this.checkForVotes()) {
							return (
								<div className='chart-container'>
									<ChartLegend pollOptions={this.props.pollOptions} />
									<MyChart pollOptions={this.props.pollOptions} />
								</div>
							)
						} else {
							return (
								<div className='results-placeholder'>No results yet</div>
							)
						}
					})()
				}
				{
					(() => {
						if(this.props.userId && this.props.pollAuthorId === this.props.userId) {
							return (
								<div className='delete-container'>
									<div className='delete-button' onClick={this.deletePoll}>Delete Poll</div>
								</div>
							)
						}
					})()
				}
			</div>
		)
	}
});

export default PollResults