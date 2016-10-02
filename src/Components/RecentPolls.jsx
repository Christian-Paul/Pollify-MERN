import { IndexLink } from 'react-router';
import React from 'react';

const RecentPolls = React.createClass({
	getInitialState: function() {
		return {
			polls: []
		}
	},
	componentDidMount: function() {
		// send request for recent polls
		var self = this;
		$.ajax('/recent-polls')
			.done(function(response) {
				self.setState({
					// add recent polls to polls state
					polls: self.state.polls.concat(JSON.parse(response))
				});
			});
	},
	render: function() {
		return (
			<div className='main-container'>
				<div className='title'>Create and participate in polls</div>
				<div className='polls-holder'>
					{this.state.polls.map(function(poll, i) {
						return (
							<div className='poll' key={i}>
								<IndexLink to={'/polls/' + poll['_id']}>{poll.title}</IndexLink>
							</div>
						)
					})}
				</div>
			</div>
		)
	}
});

export default RecentPolls