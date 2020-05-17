import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { AuthContext } from '../firebase/Auth';

/**
 * @author Shiwani Deo, Lun-Wei Chang
 * @version 1.0
 * @date 05/03/2020 
 */
function PostsList(props) {
    const { currentUser } = useContext(AuthContext);
    let card = null;
    const [postList, setPostList] = useState(props.allPosts);
    const [modalTitle, setModalTitle] = useState(undefined);
    const [modalBody, setModalBody] = useState(undefined);
    const [show, setShow] = useState(false);
    const [postID, setPostID] = useState(undefined);
    const [postUserID, setUserID] = useState(undefined);
    const [comment, setComment] = useState("");
    const [commentList, setCommentList] = useState("");

    const handleClose = () => { //Set modal show state to false
        setShow(false);
    }
    async function handleShow(post) { //Set current post data to display in the modal
        setModalTitle(post.title);
        setModalBody(post.body);
        setPostID(post._id);
        if (post.comments.length !== 0) {
            let commentIDList = post.comments;
            let comments = []
            for (let index in commentIDList) {
                const { data } = await axios.get(`http://localhost:3001/data/comment/${commentIDList[index]}`);
                comments.push(data.body);
            }
            setCommentList(comments);
            console.log(commentList);
        }
        setShow(true);
    }

    const handleDelete = async (post) => {
        const res = await axios.delete(`http://localhost:3001/data/post/${post._id}`);
        props.action();
    }

    const setCommentDetails = (commentBody) => { //Link comment to Post ID
        setComment(commentBody);
    }

    async function submitComment() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentBody: comment, userID: postUserID, postID: postID })
        };
        const response = await fetch('http://localhost:3001/data/comment/', requestOptions);
        const data = await response.json();
    }

    useEffect(() => {

        setPostList(props.allPosts);
    },
        [props.allPosts]
    );

    const buildListItem = (post) => {
        var postDetails = post.body.slice(0, 140) + '...';
        if(post.username === currentUser.displayName){
            return (
                <div className="post" key={post._id}>
                    <Col lg={4}>
                        <Card style={{ width: '18rem' }} className="postCard">
                            <Card.Header className="cardTitle">{post.title}</Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    {postDetails}
                                </Card.Text>
                                <Button variant="primary" onClick={() => { handleShow(post) }} >
                                    Post Details
                                </Button>
                                <Button variant="danger" className="deletePostButton" onClick={() => { handleDelete(post) }} >
                                    Delete
                                </Button>
                            </Card.Body>
                            <Card.Footer className="username">
                                Posted by: {post.username}
                            </Card.Footer>
                        </Card>
                    </Col>
                </div>
            );
        }else{
            return (
                <div className="post" key={post._id}>
                    <Col lg={4}>
                        <Card style={{ width: '18rem' }} className="postCard">
                            <Card.Header className="cardTitle">{post.title}</Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    {postDetails}
                                </Card.Text>
                                <Button variant="primary" onClick={() => { handleShow(post) }} >
                                    Post Details
                                </Button>
                            </Card.Body>
                            <Card.Footer className="username">
                                Posted by: {post.username}
                            </Card.Footer>
                        </Card>
                    </Col>
                </div>
            );
        }
    }

    if (postList) {
        card = postList && postList.map((post) => {
            return buildListItem(post);
        });
    }

    return (
        <div className="postPage">
            <Container>
                <Row>
                    {card}
                    <Modal show={show} onHide={handleClose} animation={false} aria-labelledby="contained-modal-title-vcenter" centered>
                        <Modal.Header closeButton>
                            <Modal.Title>{modalTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {modalBody}
                            <br></br>
                            <br></br>
                            <Form>
                                <Form.Group controlId={postID}>
                                    <Form.Control postid={postID} className="commentPlaceholder" type="text" name="commentBody" onChange={e => { setCommentDetails(e.target.value) }} placeholder="Enter comment" />
                                </Form.Group>
                            </Form>
                            <Button variant="secondary" size="sm" type="submit" onClick={submitComment}> Submit </Button>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Row>
            </Container>
        </div>
    );
}


export default PostsList;