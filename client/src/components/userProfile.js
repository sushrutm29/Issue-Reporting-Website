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
        this.state = { showPost: false }

    }

    handleSubmit = (event) => {
        event.preventDefault();
        console.log(event.target.name)
        console.log(event.target.value)
    }

    handleShow = (event) => {
        this.setState({
            showPost: true
        })
    }

    handleClose = (event) => {
        this.setState({
            showPost: false
        })
    }
    handleInputChange = (event) => {
        event.preventDefault();
        this.setState({
            [event.target.name]: event.target.value
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
                    <Card style={{ width: '20rem' }}>
                        <Card.Body>
                            <Card.Title> {post.title} </Card.Title>
                            <Card.Text>
                                <div> {post.deptID} </div>
                                <div> {post.body} </div>

                            </Card.Text>
                            <Button variant="primary" onClick={this.handleShow}>Edit</Button>
                        </Card.Body>
                    </Card>
                ))}

                <Modal show={this.state.showPost} onHide={this.handleClose} >
                    <Modal.Header closeButton>
                        <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.posts && this.state.posts.map((post) => (
                            <Card style={{ width: '20rem' }}>
                                <Card.Body>
                                    <Card.Title> {post.title} </Card.Title>
                                    <Card.Text>
                                        <input type='text' {post.deptID} />
                                        <div> {post.body} </div>

                                    </Card.Text>
                                    <Button variant="secondary" onClick={this.handleClose}>
                                        Close </Button>
                                    <br></br>
                                    <Button variant="primary" onClick={this.handleClose}>
                                        Save Changes </Button>
                                </Card.Body>
                            </Card>
                        ))}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close </Button>
                        <Button variant="primary" onClick={this.handleClose}>
                            Save Changes </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
        return html_body;
    }
}



export default userProfile;
