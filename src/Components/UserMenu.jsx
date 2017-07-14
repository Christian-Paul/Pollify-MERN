import { IndexLink } from 'react-router';
import onClickOutside from 'react-onclickoutside';
import React from 'react';

const UserMenu = onClickOutside(React.createClass({
	getInitialState: function() {
		return {
			userMenuVisible: ''
		}
	},
	handleClickOutside: function() {
		this.setState({
			userMenuVisible: ''
		})
	},
	toggleUserMenu: function() {
		// check menu status and toggle it
		var newStatus = this.state.userMenuVisible === '' ? ' triggered' : '';
		this.setState({
			userMenuVisible: newStatus
		});
	},
	signOut: function() {
		var self = this;

		$.ajax('/auth/logout')
			.done(function() {
				self.props.signOut();
			});
	},
	render: function() {
		return (
			<div className={'user-interface' + this.state.userMenuVisible} onClick={this.toggleUserMenu}>
				<div className="user-info">
					<img src={this.props.userImage} className='user-image' />
				</div>
				<div className="dropdown-arrow"></div>
				<div className="dropdown-arrow-shadow"></div>
				<div className="dropdown">
					<div className='username'>{this.props.userName}</div>
					<IndexLink to={'/users/' + this.props.userId}>My Polls</IndexLink>
					<IndexLink to='/new-poll'>New Poll</IndexLink>
					<IndexLink onClick={this.signOut}>Sign Out</IndexLink>
				</div>
			</div>
		)
	}
}));

export default UserMenu