import React, { useContext } from 'react';
import SocialSignIn from './socialSignIn.js';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../firebase/Auth';
import {
  doSignInWithEmailAndPassword,
  doPasswordReset
} from '../firebase/FirebaseFunctions';
import { Link } from 'react-router-dom';
import { Button} from 'react-bootstrap';

function SignIn() {
  const { currentUser } = useContext(AuthContext);
  const handleLogin = async (event) => {
    event.preventDefault();
    let { email, password } = event.target.elements;

    try {
      await doSignInWithEmailAndPassword(email.value, password.value);
    } catch (error) {
      alert(error);
    }
  };

  const passwordReset = (event) => {
    event.preventDefault();
    let email = document.getElementById('email').value;
    if (email) {
      doPasswordReset(email);
      alert('Password reset email was sent');
    } else {
      alert(
        'Please enter an email address below before you click the forgot password link'
      );
    }
  };
  if (currentUser) {
    return <Redirect to="/home/page/1" />;
  }
  return (
    <div className="loginComponent d-flex justify-content-center align-items-center">
      <h1 className="login">STEVENS ISSUE REPORTER<br></br><br></br>LOGIN</h1>
      <div className="verticalLine"></div>
      <div className="align-items-center">
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="loginLabel">
              Email:
                 <input className="form-control" name="email" id="email" type="email" placeholder="Enter Email" required />
            </label>
          </div>
          <div className="form-group">
            <label className="loginLabel">
              Password:
              <input className="form-control" name="password" type="password" placeholder="Enter Password" required />
            </label>
          </div>
          <Button variant="success" type="submit" className="loginButton">Login</Button>
          <br></br>
          <br></br>
          <Button variant="success" className="forgotPassword" onClick={passwordReset}> Forgot Password </Button>
        </form>
        <br></br>
        <SocialSignIn />
        <br></br>
        <Link className="App-link" to="/signup">Don't have an account? Create one now!</Link>
      </div>
    </div>
  );
}

export default SignIn;