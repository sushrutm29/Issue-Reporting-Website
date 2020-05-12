import React from 'react';
import './App.css';
import Home from './components/home';
import Department from './components/department';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './firebase/Auth';
import PrivateRoute from './components/privateRoute';
import Login from './components/login';
import SignUp from './components/signup'

const App = () => {
	return (
		<AuthProvider>
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
							<PrivateRoute path='/home/' component={Home} />
							<PrivateRoute path='/dept/:deptName' component={Department} />
							<Route path='/login' component={Login} />
							<Route path='/signup' component={SignUp} />
						</Switch>
					</div>
				</div>
			</Router>
		</AuthProvider>
	);
};

export default App;