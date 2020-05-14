import React, { Component } from "react";
import { Card, Container, Row, Col, Modal, Button, Image } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Switch, Route } from "react-router-dom";
import axios from 'axios';


class userProfile extends Component {
    constructor(props) {
        super(props);
        this.state = { userData: undefined, posts: undefined };
        this.state = {
            postsData: ''
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        console.log(event.target.name)
        console.log(event.target.value)
    }

    handleInputChange = (event) => {
        event.preventDefault();
        console.log(event)
        console.log(event.target.name)
        console.log(event.target.value)
        this.setState({
            [event.target.name] : event.target.value
        })
    }

    async componentDidMount() {
        try {
            let { data } = await axios.get(`http://localhost:3001/data/user/5e8d57d8a0890e28c5bdd2a0`);
            console.log(this.params)
            let postIds = data.posts;
            let posts = [];
            for (const id of postIds) {
                let post = await axios.get(`http://localhost:3001/data/post/${id}`);
                posts.push(post.data)
            }
            this.setState({ userData: data, posts: posts });
        } catch (error) {
        }
    }
    

    render() {
        let html_body = (
            <div>
                Username : {(this.state.userData && this.state.userData.userName) || " No Username available Here :( "}
                User's Email : {(this.state.userData && this.state.userData.userEmail) || " No User email available Here :( "}
                Posts :  {this.state.posts && this.state.posts.map((post) => (
                    <Modal.Dialog>
                        {post.title}
                        <br />
                        {/* Resolved Status :  */}
                        {post.deptID}
                        <form onSubmit={this.handleSubmit}>
                            <input type='text' placeholder='User Name' name='userName' value={post.title} onChange={this.handleInputChange} />
                            <br></br>
                            <Modal.Footer>
                                <Button variant="secondary">Edit </Button>
                                <Button variant="primary">Save changes</Button>
                                <Button variant="secondary">Cancel </Button>
                            </Modal.Footer>
                        </form >
                    </Modal.Dialog>
                ))}
            </div>
        );
        return html_body;
    }
}



export default userProfile;
