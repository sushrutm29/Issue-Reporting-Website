import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import SubmitComment from './submitComment';
import CommentList from './comments';

function PostModal(props) {
    const [modalTitle, setModalTitle] = useState(undefined);
    const [modalBody, setModalBody] = useState(undefined);
    const [show, setShow] = useState(false);
    const [commentDetails, setCommentDetails] = useState([]);

    useEffect(() => {
        setModalTitle(props.post.title);
        setModalBody(props.post.body);
    }, []);

    const handleClose = () => { //Set modal show state to false
        setShow(false);
    }

    const handleShow = async () => { //Set current post data to display in the modal
        let { data } = await axios.get(`http://localhost:3001/data/post/${props.post._id}`);
        let commentsArray = [];

        for (let index in data.comments) {
            let commentData  = await axios.get(`http://localhost:3001/data/comment/${data.comments[index]}`);
            let commentID = commentData.data._id;
            let commentbody = commentData.data.body;
            let userData = await axios.get(`http://localhost:3001/data/user/${commentData.data.userID}`);
            let commentObject = {
                "id": commentID,
                "name": userData.data.userName,
                "commentBody": commentbody
            };
            commentsArray.push(commentObject);
        }
        setCommentDetails(commentsArray);
        setShow(true);
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
                    <SubmitComment post={props.post} userID = {props.userID} action={handleShow} allComments = {commentDetails}/>
                    <CommentList allComments={commentDetails} />
                    <br></br>
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