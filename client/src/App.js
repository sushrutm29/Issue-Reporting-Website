import React from 'react';
import logo from './logo.svg';
import './App.css';
// import ShowList from './components/ShowList';
// import Show from './components/Show';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import {AuthProvider} from './firebase/Auth';

const App = () => {
	return (
		<Router>
			<div className='App'>
				<header className='App-header'>
					<img src={logo} className='App-logo' alt='logo' />
					<h1 className='App-title'>Welcome to issue reporting website</h1>
					{/* <Link className='showlink' to='/shows'>
						Shows
					</Link> */}
				</header>
				<br />
				<br />
				<div className='App-body'>
					<p>Welcome to the TV Maze API example</p>
					{/* <Route path='/shows' exact component={ShowList} />
					<Route path='/shows/:id' exact component={Show} /> */}
				</div>
			</div>
		</Router>
	);
};

export default App;