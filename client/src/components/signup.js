import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { doCreateUserWithEmailAndPassword } from '../firebase/FirebaseFunctions';
import { AuthContext } from '../firebase/Auth';
import SocialSignIn from './socialSignIn';
import { Link } from 'react-router-dom';
import axios from 'axios';

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

      if(file !== ''){
        let formData = new FormData();
        formData.append('image', file);
        console.log(formData);
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
    <div>
      <h1>Sign up</h1>
      {pwMatch && <h4 className="error">{pwMatch}</h4>}
      <form onSubmit={handleSignUp}>
        <div className="form-group">
          <label>
            Name:
            <input
              className="form-control"
              required
              name="displayName"
              type="text"
              placeholder="Name"
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Email:
            <input
              className="form-control"
              required
              name="email"
              type="email"
              placeholder="Email"
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Password:
            <input
              className="form-control"
              id="passwordOne"
              name="passwordOne"
              type="password"
              placeholder="Password"
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Confirm Password:
            <input
              className="form-control"
              name="passwordTwo"
              type="password"
              placeholder="Confirm Password"
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Profile Picture:
            <input
              className="form-control"
              id="profilePicUpload"
              name="profilePicUpload"
              type="file"
              placeholder=""
              accept="image/*"
              onChange={handleUpload}
            />
          </label>
        </div>
        <button id="submitButton" name="submitButton" type="submit">
          Sign Up
        </button>
      </form>
      <br />
      <SocialSignIn />
      <br />
      <Link className="App-link" to="/login">Already have an account? Click here to Login</Link>
    </div>
  );
}

export default SignUp;
