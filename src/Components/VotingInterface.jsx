import React from 'react';
import AlertContainer from 'react-alert';

const VotingInterface = React.createClass({
	getInitialState: function() {
		return {
			addingOption: false,
			selectedOption: '',
			newOption: '',
			disableVote: false,
			disableAddOption: false
		}
	},
	selectOption: function(event) {
		this.setState({
			selectedOption: event.target.value
		});
	},
	updateNewOption: function(event) {
		this.setState({
			newOption: event.target.value
		});
	},
	getOptions: function() {
		var self = this;
		// get options from props and render them properly
		var styledOptions = this.props.pollOptions.map(function(option, i) {
			return (
				<div className='option' key={i}>
					<label><input type='radio' name='user-choice' value={i} onClick={self.selectOption} />{option.name}</label>
				</div>
			)
		});
		return (
			<div>{styledOptions}</div>
		)
	},
	sendVote: function() {
		// send vote to server

		this.setState({
			disableVote: true
		});

		$.ajax({
			url: '/poll/' + this.props.pollId + '/vote' + '?vote=' + this.state.selectedOption,
			method: 'POST',
			success: (response) => {
				this.props.updateOptions(response);

				this.msg.success('Vote submitted!'), {
					time: 2000
				};

				this.setState({
					disableVote: false
				});
			},
			error: (response) => {
				this.msg.error('Couldn\'t apply vote. ' + response.responseText), {
					time: 2000
				};

				this.setState({
					disableVote: false
				});
			}
		});
	},
	sendNewOption: function() {
		// send new option to server
		this.setState({
			disableAddOption: true
		});

		$.ajax({
			url: '/poll/' + this.props.pollId + '/add-option' + '?newOption=' + this.state.newOption,
			method: 'POST',
			success: (response) => {
				// if successful, update state
				this.props.updateOptions(response);
				this.toggleAdding();

				this.setState({
					disableAddOption: false
				});
			},
			error: (response) => {
				// if failed, alert user
				this.msg.error('Couldn\'t add option. ' + response.responseText), {
					time: 2000
				};

				this.setState({
					disableAddOption: false
				});
			}
		});
	},
	toggleAdding: function() {
		this.setState({
			addingOption: !this.state.addingOption
		});
	},
	alertOptions: {
		offset: 14,
		position: 'top right',
		theme: 'light',
		time: 5000,
		transition: 'scale'
	},
	renderAdding: function() {
		var isInputValid = (this.state.newOption.length > 0 && this.state.newOption.length < 50);
		var disabled = this.state.disableAddOption || !isInputValid;

		return (
			<div className='voting-interface'>
				<div className='vote-form'>
					{this.getOptions()}
				</div>
				<div className='new-option'>
					<div className='new-option-form'>
						<input type='text' name='new-option' placeholder='New Option' onChange={this.updateNewOption} />
						<button 
							type='submit' 
							className='add-new' 
							onClick={this.sendNewOption} 
							disabled={disabled}>
							Add
						</button>
						<button type='button' className='cancel-new' onClick={this.toggleAdding}>Cancel</button>
						<AlertContainer ref={a => this.msg = a} {...this.alertOptions} />
					</div>
				</div>
			</div>
		)
	},
	renderDefault: function() {
		var isSelectionValid = (this.state.selectedOption !== '');
		var disabled = this.state.disableVote || !isSelectionValid;

		return (
			<div className='voting-interface'>
				<div className='vote-form'>
					{this.getOptions()}
					<div className='init-new-option' onClick={this.toggleAdding}>Or add your own option...</div>
					<button className='vote-button' type='submit' onClick={this.sendVote} disabled={disabled}>Vote!</button>
					<AlertContainer ref={a => this.msg = a} {...this.alertOptions} />
				</div>
			</div>
		)
	},
	render: function() {
		if(this.state.addingOption) {
			return this.renderAdding()
		} else {
			return this.renderDefault()
		}
	}
});

export default VotingInterface