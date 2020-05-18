import React, { Component } from "react";
import { Card, Modal, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../firebase/Auth';
import axios from 'axios';
import { doChangePassword } from '../firebase/FirebaseFunctions';
import * as firebase from 'firebase';
import ModalHeader from "react-bootstrap/ModalHeader";
import '../App.css';

/**
 * @author Sri Vallabhaneni
 * @version 1.0
 * @date 05/06/2020
 */

class userProfile extends Component {
    static contextType = AuthContext;
    constructor(props) {
        super(props);
        this.state = { userData: undefined, posts: undefined };
        this.state = { postsData: '' };
        this.state = { userState: null }
        this.state = { imageName: null }
        this.state = { imageFile: null }
        this.state = { idofuser: '' }
    }

    signUp = (event) => {
        const user = this.context;
        console.log(this.context)
    }

    handleUpload = async (event) => {
        if (event.target.files[0] !== '') {
            let formData = new FormData();
            formData.append('image', event.target.files[0]);
            console.log(formData)
            await axios.post('http://localhost:3001/data/profilepic', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            await axios.post(`http://localhost:3001/data/profilepic/${this.state.idofuser}`);
        }

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

    handleReload = () => {
        window.location.reload();
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
        if ( newpwd.length != 0 && oldpwd.length != 0){
            await doChangePassword(email, oldpwd, newpwd);
        }
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
                const userId = data._id;
                this.setState({ idofuser: userId })
                console.log(this.state.idofuser);
                const imageDetails = await axios.get(`http://localhost:3001/data/profilepic/${userId}`);
                let postIds = data.posts;
                let posts = [];
                for (const id of postIds) {
                    let post = await axios.get(`http://localhost:3001/data/post/${id}`);
                    posts.push(post.data)
                }
                this.setState({ userData: data, posts: posts });
                if (imageDetails) {
                    this.setState({ imageName: imageDetails.data.path })
                }
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
                <br></br>
                <br></br>
                <div className="profile-img-div">
                    <img src={window.location.origin + '/uploads/' + this.state.imageName} alt="image not found" />
                </div>
                <br></br>
                <br></br>
                <form onSubmit={this.handleUpload}>
                    <h6> Change Profile Picture : </h6>
                    <br></br>
                    <input type="file" variant="primary" onChange={this.handleUpload} />
                    <Button type="submit" variant="primary" > Change Profile Picture </Button>
                </form>
                <br></br>
                <Card style={{ margin: "0px auto", width: "500px" }}>

                    <h1>{(this.state.userData && this.state.userData.userName) || " No Username available Here  "}</h1>
                    <br></br>
                    <h3> {(this.state.userData && this.state.userData.userEmail) || " No User email available Here  "}</h3>
                </Card>

                <div className="change-password-wrapper" style={{ margin: "0px auto", width: "250px" }}>

                    <br></br>
                    <div>
                        <h6>Change Password</h6>
                    </div>
                    <hr></hr>
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
                <div>
                    <h4>Posts</h4>
                    <hr></hr>
                </div>
                <div className="post-wrapper row">
                    {this.state.posts && this.state.posts.map((post, index) => (
                        <Modal.Dialog key={index} className="col-md-6 col-sm-6 col-lg-6 col-xs-6">
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

            </div>
        );
        return html_body;
    }
}

export default userProfile;