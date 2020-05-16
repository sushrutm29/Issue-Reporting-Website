import React from 'react';
import './App.css';
import Home from './components/home';
import Department from './components/department';
import Error404 from './components/Error404';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
	return (
		<Router>
			<div className='App'>
				<header className='App-header'>
					<h1 className='App-title'>Stevens Issue Reporter</h1>
				</header>
				<div className='App-body'>
					<Switch>
						<Route path='/home/page/:pageNo' component={Home} />
						<Route path='/dept/:deptName/page/:pageNo' component={Department} />
						<Route component={Error404} />
					</Switch>
				</div>
			</div>
		</Router>
	);
};

export default App;