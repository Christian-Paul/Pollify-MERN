import { IndexLink } from 'react-router';
import React from 'react';

import UserMenu from './UserMenu.jsx';

const Navbar = React.createClass({
	signIn: function() {
		$.ajax('/auth/request-token')
			.done(function(response) {
				window.location = response;
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
						<UserMenu userIsAuthenticated={this.props.userIsAuthenticated} userName={this.props.userName} userImage={this.props.userImage} userId={this.props.userId} />
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