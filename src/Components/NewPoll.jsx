import React from 'react';

const NewPoll = React.createClass({
	contextTypes: {
	  	router: React.PropTypes.object.isRequired
	},
	getInitialState: function() {
		return {
			pollTitle: '',
			pollOptions: {}
		}
	},
	updateTitle: function(event) {
		this.setState({
			pollTitle: event.target.value
		});
	},
	updateOptions: function(event) {
		var tempOptions = this.state.pollOptions;

		tempOptions[event.target.name] = event.target.value;

		this.setState({
			pollOptions: tempOptions
		});
	},
	postPoll: function() {
		var self = this;

		console.log(self.state.pollTitle);

		$.ajax({
			type: 'POST',
			data: {
				pollTitle: self.state.pollTitle,
				pollOptions: self.state.pollOptions
			},
			url: '/create-poll',
			success: function(response){
				// redirect to new poll
				self.context.router.push('/polls/' + response.newPollId);
			}
		});
	},
	render: function() {
		return (
			<div className='main-container'>
				<div className='form-outline'>
					<div className='form-holder'>
						<div className='title' onChange={this.updateTitle}>Create a New Poll</div>
						<div className='form'>
							<input type='text' name='title' placeholder='Your Poll title' className='poll-title-input' onChange={this.updateTitle} />
							<div className='options-holder'>
								<input type='text' placeholder='Enter options here...' name='option-1' onChange={this.updateOptions} />
								<input type='text' placeholder='Enter options here...' name='option-2' onChange={this.updateOptions} />
								<input type='text' placeholder='Enter options here...' name='option-3' onChange={this.updateOptions} />
							</div>
							<button onClick={this.postPoll}>Submit</button>
						</div>
					</div>
				</div>
			</div>
		)
	}
});

export default NewPoll