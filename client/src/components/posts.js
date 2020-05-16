import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import NavigationBar from './navigation';

/**
 * @author Shiwani Deo, Lun-Wei Chang
 * @version 1.0
 * @date 05/03/2020
 */
function PostsList(props) {
    let card = null;
    const [postList, setPostList] = useState(props.allPosts);
    const [modalTitle, setModalTitle] = useState(undefined);
    const [modalBody, setModalBody] = useState(undefined);
    const [show, setShow] = useState(false);
    const [postID, setPostID] = useState(undefined);
    const [comment, setComment] = useState("");
    const [postUserID, setUserID] = useState(undefined)

    const handleClose = () => { //Set modal show state to false
        setShow(false);
    }
    const handleShow = (post) => { //Set current post data to display in the modal
        setModalTitle(post.title);
        setModalBody(post.body);
        setPostID(post._id);
        setShow(true);
    }

    const setCommentDetails = (commentBody) => { //Link comment to Post ID
        setComment(commentBody);
    }

    async function submitComment () {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentBody: comment, userID: postUserID, postID: postID})
        };
        const response = await fetch('http://localhost:3001/data/comment/', requestOptions);
        const data = await response.json();
        console.log(data);
    }

    useEffect(() => {
        setPostList(props.allPosts);
    },
        [props.allPosts]
    );

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
                        </Card.Body>
                        <Card.Footer className="username">
                            Posted by: {post.username}
                        </Card.Footer>
                    </Card>
                </Col>
            </div>
        );
    }

    if (postList) {
        card = postList && postList.map((post) => {
            return buildListItem(post);
        });
    }

    let navigationBar = NavigationBar();

    return (
        <div className="postPage">
            {navigationBar}
            <Container>
                <Row>
                    {card}
                    <Modal show={show} onHide={handleClose} aria-labelledby="contained-modal-title-vcenter" centered>
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