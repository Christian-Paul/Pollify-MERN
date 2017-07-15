import React from 'react';

const VotingInterface = React.createClass({
	getInitialState: function() {
		return {
			addingOption: false,
			selectedOption: '',
			newOption: ''
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
		var self = this;
		$.ajax({
			url: '/poll/' + self.props.pollId + '/vote' + '?vote=' + self.state.selectedOption,
			method: 'POST',
			success: function(response) {
				self.props.updateOptions(response);
			},
			error: function(response) {
				alert('Could not apply vote. ' + response.responseText);
			}
		});
	},
	sendNewOption: function() {
		// send new option to server
		var self = this;
		$.ajax({
			url: '/poll/' + self.props.pollId + '/add-option' + '?newOption=' + self.state.newOption,
			method: 'POST',
			success: function(response) {
				// if successful, update state
				self.props.updateOptions(response);
				self.toggleAdding();
			},
			error: function(response) {
				// if failed, alert user
				alert(response.responseText);
			}
		});
	},
	toggleAdding: function() {
		this.setState({
			addingOption: !this.state.addingOption
		});
	},
	renderAdding: function() {
		return (
			<div className='voting-interface'>
				<div className='vote-form'>
					{this.getOptions()}
				</div>
				<div className='new-option'>
					<div className='new-option-form'>
						<input type='text' name='new-option' placeholder='New Option' onChange={this.updateNewOption} />
						<button type='submit' className='add-new' onClick={this.sendNewOption}>Add</button>
						<button type='button' className='cancel-new' onClick={this.toggleAdding}>Cancel</button>
					</div>
				</div>
			</div>
		)
	},
	renderDefault: function() {
		return (
			<div className='voting-interface'>
				<div className='vote-form'>
					{this.getOptions()}
					<div className='init-new-option' onClick={this.toggleAdding}>Or add your own option...</div>
					<button className='vote-button' type='submit' onClick={this.sendVote}>Vote!</button>
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