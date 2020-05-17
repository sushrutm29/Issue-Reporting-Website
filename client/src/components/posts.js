import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import NavigationBar from './navigation';
import { AuthContext } from '../firebase/Auth';

/**
 * @author Shiwani Deo, Lun-Wei Chang
 * @version 1.0
 * @date 05/03/2020 
 */
function PostsList(props) {
    let card = null;
    const { currentUser } = useContext(AuthContext);
    const [postList, setPostList] = useState(props.allPosts);
    const [modalTitle, setModalTitle] = useState(undefined);
    const [modalBody, setModalBody] = useState(undefined);
    const [show, setShow] = useState(false);
    const [postID, setPostID] = useState(undefined);
    const [postUserID, setUserID] = useState(undefined);
    const [comment, setComment] = useState("");
    const [commentList, setCommentList] = useState("");
    const [adminStatus, setAdminStatus] = useState(false);

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
        async function getAdminStatus() {
            try {
                let userEmail = await currentUser.email;
                const { data } = await axios.get(`http://localhost:3001/data/user/email/${userEmail}`);
                setAdminStatus(data.admin);
            } catch (error) {
                console.log(error);
            }
        }
        setPostList(props.allPosts);
        getAdminStatus();
    }, [props.allPosts]);

    const buildListItem = (post) => {
        var postDetails = post.body.slice(0, 140) + '...';
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
                            {edit_button}
                        </Card.Body>
                        <Card.Footer className="username">
                            Posted by: {post.username}
                        </Card.Footer>
                    </Card>
                </Col>
            </div>
        );
    }

    let edit_button = null;
    if (adminStatus) {
        edit_button = <Button variant="primary" onClick={() => {}} >
        Edit Post
        </Button>;
    }


    if (postList) {
        card = postList && postList.map((post) => {
            return buildListItem(post);
        });
    }
    // console.log(`currentUser name = ${currentUser.displayName}`);
    let navigationBar = NavigationBar();
    return (
        <div className="postPage">
            {navigationBar}
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