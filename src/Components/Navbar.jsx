import { IndexLink } from 'react-router';
import React from 'react';

const Navbar = React.createClass({
	getInitialState: function() {
		return {
			userMenuVisible: ''
		}
	},
	toggleUserMenu: function() {
		// check menu status and toggle it
		var newStatus = this.state.userMenuVisible === '' ? ' triggered' : '';
		this.setState({
			userMenuVisible: newStatus
		});
	},
	signIn: function() {
		$.ajax('/request-token')
			.done(function(response) {
				console.log(response);
				window.location = response;
			});
	},
	signOut: function() {
		var self = this;

		$.ajax('/sign-out')
			.done(function() {
				self.props.signOut();
			});
	},
	renderDefault: function() {
		return (
			<div className='navbar-container'>
				<div className="navbar">
					<div className='destination'>
						<IndexLink className='logo-holder' to='/'>
							<svg className='logo' version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 24 24">
								<path className="path1" d="M17.016 17.016v-4.031h-2.016v4.031h2.016zM12.984 17.016v-10.031h-1.969v10.031h1.969zM9 17.016v-7.031h-2.016v7.031h2.016zM18.984 3c1.078 0 2.016 0.938 2.016 2.016v13.969c0 1.078-0.938 2.016-2.016 2.016h-13.969c-1.078 0-2.016-0.938-2.016-2.016v-13.969c0-1.078 0.938-2.016 2.016-2.016h13.969z"></path>
							</svg>
				          <div className='logo-name'>Pollify</div>
				        </IndexLink>
					</div>
					<div className='destination'>
						<div className="sign-in">
							<IndexLink onClick={this.signIn}>Sign in</IndexLink>
						</div>
					</div>
				</div>
			</div>
		)
	},
	renderAuthenticatedUser: function() {
		return (
			<div className='navbar-container'>
				<div className="navbar">
					<div className='destination'>
						<IndexLink className='logo-holder' to='/'>
							<svg className='logo' version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 24 24">
								<path className="path1" d="M17.016 17.016v-4.031h-2.016v4.031h2.016zM12.984 17.016v-10.031h-1.969v10.031h1.969zM9 17.016v-7.031h-2.016v7.031h2.016zM18.984 3c1.078 0 2.016 0.938 2.016 2.016v13.969c0 1.078-0.938 2.016-2.016 2.016h-13.969c-1.078 0-2.016-0.938-2.016-2.016v-13.969c0-1.078 0.938-2.016 2.016-2.016h13.969z"></path>
							</svg>
				          <div className='logo-name'>Pollify</div>
				        </IndexLink>
					</div>
					<div className='destination'>
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
					</div>
				</div>
			</div>
		)
	},
	render: function() {
		if(this.props.userIsAuthenticated) {
			return this.renderAuthenticatedUser();
		} else {
			return this.renderDefault();
		}
	}
});

export default Navbar