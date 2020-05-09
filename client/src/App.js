import React from 'react';
import './App.css';
import Home from './components/home';
import Department from './components/department';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
						<Route path='/home/' component={Home} />
						<Route path='/dept/:deptName' component={Department} />
					</Switch>
				</div>
			</div>
		</Router>
	);
};

export default App;