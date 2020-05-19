import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { doCreateUserWithEmailAndPassword } from '../firebase/FirebaseFunctions';
import { AuthContext } from '../firebase/Auth';
import SocialSignIn from './socialSignIn';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button} from 'react-bootstrap';

function SignUp() {
  const { currentUser } = useContext(AuthContext);
  const [pwMatch, setPwMatch] = useState('');
  const [file, setFile] = useState('');

  if (currentUser) {
    return <Redirect to="/home/page/1" />;
  }

  const handleUpload = e => {
    setFile(e.target.files[0]);
  }

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { displayName, email, passwordOne, passwordTwo } = e.target.elements;

    if (passwordOne.value !== passwordTwo.value) {
      setPwMatch('Passwords do not match!');
      return false;
    }

    try {
      await doCreateUserWithEmailAndPassword(
        email.value,
        passwordOne.value,
        displayName.value
      );

      if (file !== '') {
        let formData = new FormData();
        formData.append('image', file);

        await axios.post('http://localhost:3001/data/profilepic', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      await axios({
        method: 'post',
        url: 'http://localhost:3001/data/user',
        data: {
          userName: displayName.value,
          userEmail: email.value,
          admin: false,
          profilePic: (file !== '')
        },
      });

    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="signupComponent d-flex justify-content-center align-items-center">
      <h1 className="signup">STEVENS ISSUE REPORTER<br></br><br></br>SIGNUP</h1>
      <div class="verticalLineSignup"></div>
      <div className="align-items-center">
        {pwMatch && <h4 className="error">{pwMatch}</h4>}
        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label className="signupLabel">
              Name:
            <input className="form-control" required name="displayName" type="text" placeholder="Enter Name" />
            </label>
          </div>
          <div className="form-group">
            <label className="signupLabel">
              Email:
            <input className="form-control" required name="email" type="email" placeholder="Enter Email" />
            </label>
          </div>
          <div className="form-group">
            <label className="signupLabel">
              Password:
            <input className="form-control" id="passwordOne" name="passwordOne" type="password" placeholder="Enter Password" required />
            </label>
          </div>
          <div className="form-group">
            <label className="signupLabel">
              Confirm Password:
            <input className="form-control" name="passwordTwo" type="password" placeholder="Confirm Password" required />
            </label>
          </div>
          <div className="form-group">
            <label className="signupLabel">
              Profile Picture:
            <input className="form-control" id="profilePicUpload" name="profilePicUpload" type="file" onChange={handleUpload} />
            </label>
          </div>
          <Button variant="success" className="signupButton" id="submitButton" name="submitButton" type="submit">Sign Up </Button>
        </form>
        <br />
        <SocialSignIn />
        <br />
        <Link className="App-link" to="/login">Already have an account? Click here to Login</Link>
      </div>
    </div>
  );
}

export default SignUp;
