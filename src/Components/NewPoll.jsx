import React from 'react';

const NewPoll = React.createClass({
	contextTypes: {
	  	router: React.PropTypes.object.isRequired
	},
	getInitialState: function() {
		return {
			pollTitle: '',
			pollOptions: {
				'option-1': '',
				'option-2': '',
				'option-3': ''
			}
		}
	},
	updateTitle: function(event) {
		this.setState({
			pollTitle: event.target.value
		});
	},
	updateOptions: function(event) {
		var tempOptions = this.state.pollOptions;
		var optionsFull = true;

		tempOptions[event.target.name] = event.target.value;

		this.setState({
			pollOptions: tempOptions
		});

		for (var item in tempOptions) {
			if(tempOptions[item].length === 0) {
				optionsFull = false;
			}
 		}

 		if(optionsFull) {
 			this.appendInput(Object.keys(this.state.pollOptions).length + 1);
 		}

	},
	appendInput: function(inputNumber) {
		// update state to include new option
		var tempOptions = this.state.pollOptions;
		var optionName = 'option-' + inputNumber;
		tempOptions[optionName] = '';

		this.setState({
			pollOptions: tempOptions
		})
	},
	getOptions: function() {
		var self = this;
		var optionsArray = Object.keys(this.state.pollOptions);

		return optionsArray.map(function(option, i) {
			return <input type='text' placeholder='Enter Options Here...' name={option} key={i} onChange={self.updateOptions} />
		});
	},
	postPoll: function() {
		var self = this;

		$.ajax({
			type: 'POST',
			data: {
				pollTitle: self.state.pollTitle,
				pollOptions: self.state.pollOptions
			},
			url: '/poll/new',
			success: function(response){
				// redirect to new poll
				self.context.router.push('/polls/' + response.newPollId);
			}
		});
	},
	render: function() {
		return (
			<div className='new-poll-main-container'>
				<div className='form-outline'>
					<div className='form-holder'>
						<div className='title' onChange={this.updateTitle}>Create a New Poll</div>
						<div className='form'>
							<input type='text' name='title' placeholder='Your Poll Title' className='poll-title-input' onChange={this.updateTitle} />
							<div className='options-holder'>
								{this.getOptions()}
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