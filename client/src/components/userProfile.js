import React, { Component } from "react";
import { Card, Container, Row, Col, Modal, Button, Image, ModalFooter } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../firebase/Auth';
import axios from 'axios';
import { doChangePassword } from '../firebase/FirebaseFunctions';
import * as firebase from 'firebase';
import ModalHeader from "react-bootstrap/ModalHeader";

class userProfile extends Component {
    static contextType = AuthContext;
    constructor(props) {
        super(props);
        this.state = { userData: undefined, posts: undefined };
        this.state = { postsData: '' };
        this.state = { userState: null }

    }

    signUp = (event) => {
        const user = this.context;
        console.log(this.context)
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        const title = event.target.postTitle.value;
        const body = event.target.postBody.value;
        const id = event.target.postID.value;
        const postDetails = {
            title,
            body
        }
        console.log(postDetails)
        try {
            await axios({
                method: 'patch',
                url: `http://localhost:3001/data/post/update/${id}`,
                data: postDetails
            });
            window.location.reload();

        } catch (error) {
            console.log(error);
        }
    }

    handleInputChange = (event) => {
        event.preventDefault();
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    changePassword = async (event) => {
        event.preventDefault();
        const oldpwd = event.target.oldpassword.value;
        const newpwd = event.target.newpassword.value;
        const email = this.state.userData.userEmail;
        await doChangePassword(email, oldpwd, newpwd);
        alert("Password Successfully Changed! Please Login back! ");
        window.location.href = "/login";
    }

    currentUser = () => {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    resolve(user.displayName);
                } else {
                    resolve(null);
                }
            });
        });
    }

    openEditForm = (openClassName, closeClassName) => {
        var divToOpen = document.getElementsByClassName(openClassName);
        var divToClose = document.getElementsByClassName(closeClassName);

        for (var i = 0; i < divToOpen.length; i++) {
            divToOpen[i].style.display = "block";
        }

        for (var i = 0; i < divToClose.length; i++) {
            divToClose[i].style.display = "none";
        }
    }

    async getUserPostDetails() {
        try {
            let user = await this.currentUser();
            if (user != null) {
                let { data } = await axios.get(`http://localhost:3001/data/user/name/${user}`);
                let postIds = data.posts;
                let posts = [];
                for (const id of postIds) {
                    console.log(id);
                    let post = await axios.get(`http://localhost:3001/data/post/${id}`);
                    posts.push(post.data)
                }
                this.setState({ userData: data, posts: posts });
            }
            else {
                window.location.href = "/login";
            }
        } catch (error) {
            console.log(error)
        }
    }

    async componentDidMount() {
        try {

            await this.getUserPostDetails();
        } catch (error) {
            console.log("error : ", error);
        }
    }

    render() {
        let html_body = (
            <div>
                <Card style={{ margin: "0px auto", width: "500px" }}>

                    <h1>Username : {(this.state.userData && this.state.userData.userName) || " No Username available Here  "}</h1>
                    <br></br>
                    <h3>User's Email : {(this.state.userData && this.state.userData.userEmail) || " No User email available Here  "}</h3>
                </Card>

                <div className="change-password-wrapper" style={{ margin: "0px auto", width: "250px" }}>

                    <br></br>
                    <div>
                        <h4>Change Password</h4>
                    </div>
                    <br></br>
                    <form onSubmit={this.changePassword}>
                        <div className="form-group">
                            <div>
                                <input type="password" className="form-control" name="oldpassword" placeholder="old password"></input>
                            </div>
                            <br></br>
                            <div>
                                <input type="password" className="form-control" name="newpassword" placeholder="new password"></input>
                            </div>
                            <br></br>
                            <div>
                                <Button type="submit" variant="primary"> Change Password </Button>
                            </div>
                        </div>
                    </form>
                </div>
                {this.state.posts && this.state.posts.map((post, index) => (
                    <Modal.Dialog key={index}>
                        <br></br>
                        <form onSubmit={this.handleSubmit}>
                            <div className={index + "-edit edit-post-div"} style={{ display: "none" }}>
                                <br></br>
                                <label>Post Title  :  </label>
                                <input type='text' placeholder='post-title' name='postTitle' defaultValue={post.title} onChange={this.handleInputChange} />
                                <br></br>
                                <input type='text' name='postID' hidden value={post._id} readOnly />
                                <br></br>
                                <label>Post Body  : </label>
                                <input type='text' placeholder='post-body' name='postBody' defaultValue={post.body} onChange={this.handleInputChange} />
                                <br></br>
                                <br></br>
                                <Modal.Footer>
                                    <Button type="submit" variant="primary"> Save changes</Button>
                                </Modal.Footer>
                            </div>
                            <div className={index + "-show"}>
                                <ModalHeader>
                                    <div>Post Title : {post.title}</div>
                                </ModalHeader>
                                <br></br>
                                <div>Post Body  : {post.body}</div>
                                <br></br>

                                <Button variant="secondary" showedit={index + "-edit"} onClick={() => this.openEditForm(index + "-edit", index + "-show")} > Edit</Button>

                            </div>
                        </form >
                        <br></br>
                    </Modal.Dialog>
                ))}
            </div>
        );
        return html_body;
    }
}



export default userProfile;