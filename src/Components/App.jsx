import React from 'react';
import { Router, Route, IndexLink, IndexRoute, hashHistory, browserHistory } from 'react-router';

import Layout from './Layout.jsx';
import NewPoll from './NewPoll.jsx';
import NotFound from './NotFound.jsx';
import Poll from './Poll.jsx';
import RecentPolls from './RecentPolls.jsx';
import UserPolls from './UserPolls.jsx';

const App = React.createClass({
	render: function() {
		return (
			<Router history={hashHistory}>
				<Route path='/' component={Layout}>
					<IndexRoute component={RecentPolls} />
					<Route path='/users/:user' component={UserPolls} />
					<Route path='/polls/:poll' component={Poll} />
					<Route path='/new-poll' component={NewPoll} />
					<Route path='*' component={NotFound} />
				</Route>
			</Router>
		)
	}
});

export default App