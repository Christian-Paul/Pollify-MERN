import React from 'react';
import { IndexLink } from 'react-router';

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
		$.ajax('/check-auth')
			.done(function(response) {
				if(response !== 'not authenticated') {
					// if they are authenticated, set user information
					that.setState({
						userIsAuthenticated: true,
						userName: response['screen_name'],
						userImage: response['profile_image_url_https'],
						userId: response.id
					});
				}
			})
	},
	signOut: function() {
		this.setState({
			userIsAuthenticated: false,
			userName: '',
			userImage: '',
			userId: ''
		});
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
				<Navbar signOut={this.signOut} userIsAuthenticated={this.state.userIsAuthenticated} userName={this.state.userName} userImage={this.state.userImage} userId={this.state.userId} />
				{children}
				<Footer />
			</div>
		)
	}
});

export default Layout