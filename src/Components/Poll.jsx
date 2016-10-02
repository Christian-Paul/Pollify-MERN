import { IndexLink } from 'react-router';
import React from 'react';

import PollResults from './PollResults.jsx';
import VotingInterface from './VotingInterface.jsx';

const Poll = React.createClass({
	getInitialState: function() {
		return {
			pollTitle: '',
			pollId: '',
			pollAuthor: '',
			pollAuthorId: '',
			pollOptions: [],
			pollVoters: []
		}
	},
	componentDidMount: function() {
		// send request for poll data
		var self = this;
		$.ajax('/polls/' + self.props.params.poll)
			.done(function(response) {
				response = JSON.parse(response);
				self.setState({
					pollTitle: response.title,
					pollId: response['_id'],
					pollAuthor: response.author.name,
					pollAuthorId: response.author.twitterId,
					pollOptions: response.options,
					pollVoters: response.voters
				});
			});
	},
	updateOptions: function(newOptions) {
		this.setState({
			pollOptions: newOptions
		});
	},
	render: function() {
		return (
			<div className='main-container'>
				<div className='poll-outline'>
					<div className='poll-holder'>
						<div className='poll-interface'>
							<div className='poll-title'>{this.state.pollTitle}</div>
							<div className='poll-author'>by <IndexLink to={'/users/' + this.state.pollAuthorId}>{this.state.pollAuthor}</IndexLink></div>
							<VotingInterface pollOptions={this.state.pollOptions} pollId={this.state.pollId} updateOptions={this.updateOptions} />
						</div>
						<PollResults pollId={this.state.pollId} pollAuthorId={this.state.pollAuthorId} userId={this.props.userId} pollOptions={this.state.pollOptions} />
					</div>
				</div>
			</div>
		)
	}
});

export default Poll