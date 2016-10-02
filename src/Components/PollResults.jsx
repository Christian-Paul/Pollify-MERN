import { IndexLink } from 'react-router';
import MyChart from './MyChart.jsx';
import React from 'react';

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
	getStyledOptions: function() {
		var styledOptions =	this.props.pollOptions.map(function(option, i) {
			return <div key={i}>{option.name}: {option.votes}</div>
		})

		return (styledOptions)
	},
	renderOwner: function() {
		// show this view only if user is the owner of the poll
		return (
			<div className='poll-results'>
				<div className='text-results'>{this.getStyledOptions()}</div>
				<MyChart pollOptions={this.props.pollOptions} />
				<div className='delete-container'>
					<div className='delete-button' onClick={this.deletePoll}>Delete Poll</div>
				</div>
			</div>
		)
	},
	renderDefault: function() {
		return (
			<div className='poll-results'>
				<div className='text-results'>{this.getStyledOptions()}</div>
				<MyChart pollOptions={this.props.pollOptions} />
			</div>
		)
	},
	render: function() {
		if(this.props.userId && this.props.pollAuthorId === this.props.userId) {
			return this.renderOwner()
		} else {
			return this.renderDefault()
		}
	}
});

export default PollResults