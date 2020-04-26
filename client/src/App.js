import React from 'react';
import './App.css';
// import ShowList from './components/ShowList';
// import Show from './components/Show';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Department from "./components/department";

const App = () => {
	return (
		<Router>
			<div className='App'>
				<header className='App-header'>
					<h3 className='App-title'>Issue reporting website</h3>
					{/* <Link className='showlink' to='/shows'>
						Shows
					</Link> */}
				</header>
				<br />
				<br />
				<div className='App-body'>
					<Route path="/department" component={ Department } />
					{/* <Route path='/shows' exact component={ShowList} />
					<Route path='/shows/:id' exact component={Show} /> */}
				</div>
			</div>
		</Router>
	);
};

export default App;