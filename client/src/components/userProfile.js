import React, { Component } from "react";
import { Card, Container, Row, Col, Modal, Button, Image } from 'react-bootstrap';
import { AuthContext } from '../firebase/Auth';
import axios from 'axios';

class userProfile extends Component {
    static contextType = AuthContext;
    constructor(props) {
        super(props);
        this.state = { userData: undefined, posts: undefined };
        this.state = { postsData: '' };
    
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

    openEditForm = (openClassName, closeClassName ) => {
        var divToOpen = document.getElementsByClassName(openClassName);
        var divToClose = document.getElementsByClassName(closeClassName);

        for(var i = 0; i < divToOpen.length; i++){
            divToOpen[i].style.display = "block"; 
        }

        for(var i = 0; i < divToClose.length; i++){
            divToClose[i].style.display = "none"; 
        }
    }

    async getUserPostDetails(){
        try {
            this.signUp();
            const user = this.context;
            console.log(user);
            let { data } = await axios.get(`http://localhost:3001/data/user/5e8d57d8a0890e28c5bdd2a0`);
            // let { data } = await axios.get(`http://localhost:3001/data/user/name/${this.user.currentUser.displayName}`);
            let postIds = data.posts;
            let posts = [];
            for (const id of postIds) {
                let post = await axios.get(`http://localhost:3001/data/post/${id}`);
                posts.push(post.data)
            }
            this.setState({ userData: data, posts: posts });
            
        } catch (error) {
            console.log(error)
        }
    }

    async componentDidMount() {
        try {
            await this.getUserPostDetails();
            // console.log(this.context);
            // let { data } = await axios.get(`http://localhost:3001/data/user/5e8d57d8a0890e28c5bdd2a0`);
            // // let { data } = await axios.get(`http://localhost:3001/data/user/name/${this.user.currentUser.displayName}`);
            // let postIds = data.posts;
            // let posts = [];
            // for (const id of postIds) {
            //     let post = await axios.get(`http://localhost:3001/data/post/${id}`);
            //     posts.push(post.data)
            // }
            // this.setState({ userData: data, posts: posts });
        } catch (error) {
            console.log("error : ", error);
        }
    }

    render() {
        let html_body = (
            <div>  
                <h2>Username : {(this.state.userData && this.state.userData.userName) || " No Username available Here :( "}</h2>
                <br></br>
                <h2>User's Email : {(this.state.userData && this.state.userData.userEmail) || " No User email available Here :( "}</h2>
                {this.state.posts && this.state.posts.map((post, index) => (
                    <Modal.Dialog key={index}>
                        <form onSubmit={this.handleSubmit}>
                            <div className={index + "-edit edit-post-div"} style={{display : "none"}}>
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
                                <div>Post Title : {post.title}</div>
                                <div>Post Body  : {post.body}</div>
                                <Button variant="secondary" showedit={index + "-edit"} onClick={() => this.openEditForm(index+"-edit", index+"-show")} > Edit</Button>
                            </div>

                        </form >
                    </Modal.Dialog>
                ))}
            </div>
        );
        return html_body;
    }
}



export default userProfile;
