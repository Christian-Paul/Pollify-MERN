import { IndexLink } from 'react-router';
import React from 'react';

const UserPolls = React.createClass({
	getInitialState: function() {
		return {
			userId: '',
			userName: '',
			polls: []
		}
	},
	componentDidMount: function() {
		// send request for user's polls
		var self = this;
		$.ajax('/user-polls/' + self.props.params.user)
			.done(function(response) {
				var response = JSON.parse(response)
				self.setState({
					// add recent polls to polls state
					userId: self.props.params.user,
					userName: response[0].author.name,
					polls: self.state.polls.concat(response)
				});
			});
	},
	render: function() {
		return (
			<div className='main-container'>
				<div className='title'>Here are {this.state.userName}'s polls</div>
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

export default UserPolls