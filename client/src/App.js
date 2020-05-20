import React from 'react';
import './App.css';
import Home from './components/home';
import Department from './components/department';
import Error404 from './components/Error404';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './firebase/Auth';
import PrivateRoute from './components/privateRoute';
import Login from './components/login';
import SignUp from './components/signup'
import userProfile from './components/userProfile';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
	return (
		<AuthProvider>
			<Router>
				<div className='App'>
					{/* <header className='App-header'>
						<h1 className='App-title'>Stevens Issue Reporter</h1>
					</header> */}
					<div className='App-body'>
						<Switch>
							<PrivateRoute exact path='/home/page/:pageNo' component={Home} />
							<PrivateRoute exact path='/dept/:deptName/page/:pageNo' component={Department}/>
							<Route exact path='/login' component={Login} />
							<Route exact path='/signup' component={SignUp} />
							<PrivateRoute exact path='/profile' component={userProfile} /> 
							<Route component={Error404}/>
						</Switch>
					</div>
				</div>
			</Router>
		</AuthProvider>
	);
};

export default App;