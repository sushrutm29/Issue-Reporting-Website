import React from 'react';
import './App.css';
import PostsList from './components/posts';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
	return (
		<Router>
			<div className='App'>
				<header className='App-header'>
					<h1 className='App-title'>Welcome to issue reporting website</h1>
					{/* <Link className='showlink' to='/shows'>
						Shows
					</Link> */}
				</header>
				<br />
				<br />
				<div className='App-body'>
					<Switch>
						<Route path='/home/posts' component={PostsList} />
					</Switch>
				</div>
			</div>
		</Router>
	);
};

export default App;