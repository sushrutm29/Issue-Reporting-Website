import firebase from 'firebase/app';
import axios from 'axios';

async function doCreateUserWithEmailAndPassword(email, password, displayName){
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    firebase.auth().currentUser.updateProfile({displayName: displayName});
}

async function doChangePassword(email, oldPassword, newPassword) {
	let credential = firebase.auth.EmailAuthProvider.credential(email, oldPassword);
	await firebase.auth().currentUser.reauthenticateWithCredential(credential);
	await firebase.auth().currentUser.updatePassword(newPassword);
	await doSignOut();
}

async function doSignInWithEmailAndPassword(email, password) {
	await firebase.auth().signInWithEmailAndPassword(email, password);
}

async function doSocialSignIn(provider) {
	let socialProvider = null;
	let newUserName = undefined;
	let newEmail = undefined;
	if (provider === 'google') {
		socialProvider = new firebase.auth.GoogleAuthProvider();
	} else if (provider === 'facebook') {
		socialProvider = new firebase.auth.FacebookAuthProvider();
	}
	await firebase.auth().signInWithPopup(socialProvider).then(async function(result) {
		newUserName = result.user.displayName;
		newEmail = result.user.email;
		try {
			await axios({
				method: 'post',
				url: 'http://localhost:3001/data/user',
				data: {
					userName: newUserName,
					userEmail: newEmail,
					admin: false,
					profilePic: false
				},
			});
		} catch (error) {}
	  }).catch(function(error) {
		alert(error.message);
	  });
}

async function doPasswordReset(email) {
	await firebase.auth().sendPasswordResetEmail(email);
}

async function doSignOut() {
	await firebase.auth().signOut();
	alert("Signed out");
}

export {
	doCreateUserWithEmailAndPassword,
	doSocialSignIn,
	doSignInWithEmailAndPassword,
	doPasswordReset,
	doSignOut,
	doChangePassword
};