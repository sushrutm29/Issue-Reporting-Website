import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import CommentList from './comments';

function PostModal(props) {
    const [modalTitle, setModalTitle] = useState(undefined);
    const [modalBody, setModalBody] = useState(undefined);
    const [postID, setPostID] = useState(undefined);
    const [postUserID, setUserID] = useState(undefined);
    const [show, setShow] = useState(false);
    const [comment, setComment] = useState("");
    const [commentList, setCommentList] = useState([]);

    useEffect(() => {
        setUserID(props.userID);

    }, [commentList]);

    const handleClose = () => { //Set modal show state to false
        setShow(false);
    }

    const handleShow = async (post) => { //Set current post data to display in the modal
        setModalTitle(post.title);
        setModalBody(post.body);
        setPostID(post._id);
        await updateCommentList(post._id);
        setShow(true);
    }

    async function updateCommentList(post_id) {
        const { data } = await axios.get(`http://localhost:3001/data/post/${post_id}`);
        setCommentList(data.comments);
    }

    const setCommentDetails = (commentBody) => { //Link comment to Post ID
        setComment(commentBody);
    }

    async function submitComment() {
        console.log(postUserID);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentBody: comment, userID: postUserID, postID: postID })
        };
        const response = await fetch('http://localhost:3001/data/comment/', requestOptions);
        const data = await response.json();
       setCommentList(commentList => commentList.concat(data._id));
    }

    return (
        <div>
            <Button variant="primary" onClick={() => { handleShow(props.post) }} >
                Post Details
            </Button>
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
                    <br></br>
                    <CommentList allComments={commentList} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default PostModal;