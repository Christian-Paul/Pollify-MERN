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
		$.ajax({
			url: '/user/' + this.props.params.user,
			success: (response) => {
				var response = JSON.parse(response);

				if(response.length > 0) {
					this.setState({
						// add recent polls to polls state
						userId: this.props.params.user,
						userName: response[0].author.name,
						polls: this.state.polls.concat(response)
					});
				}
			}
		})
	},
	render: function() {
		return (
			(this.state.polls.length > 0 ? (
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
				) : (
				<div className='main-container'>
					<div className='title'>Nothing here yet.</div>
					<div className='polls-holder'>
						<IndexLink to='/new-poll'>
							<button>New Poll</button>
						</IndexLink>
					</div>
				</div>
			))
		)
	}
});

export default UserPolls