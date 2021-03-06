import { IndexLink } from 'react-router';
import React from 'react';

import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';

const Layout = React.createClass({
	getInitialState: function() {
		return {
			userIsAuthenticated: false,
			userName: '',
			userImage: '',
			userId: ''
		}
	},
	componentDidMount: function() {
		var that = this;
		// check if user is authenticated
		$.ajax('/auth/check-auth')
			.done(function(response) {
				if(response.logged) {
					// if they are authenticated, set user information
					that.setState({
						userIsAuthenticated: true,
						userName: response.userInfo['screen_name'],
						userImage: response.userInfo['profile_image_url_https'],
						userId: response.userInfo.id
					});
				} else {
					that.setState({
						userIsAuthenticated: false,
						userName: '',
						userImage: '',
						userId: ''
					})
				}
			})
	},
	render: function() {
		var self = this;
		// Use react helper methods to pass state to arbitrary child component
		var children = React.Children.map(this.props.children, function (child) {
			return React.cloneElement(child, {
				userIsAuthenticated: self.state.userIsAuthenticated,
				userName: self.state.foo,
				userId: self.state.userId
			})
		})

		return (
			<div>
				<Navbar userIsAuthenticated={this.state.userIsAuthenticated} userName={this.state.userName} userImage={this.state.userImage} userId={this.state.userId} />
				{children}
				<Footer />
			</div>
		)
	}
});

export default Layout