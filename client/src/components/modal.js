import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import SubmitComment from './submitComment';
import CommentList from './comments';
import { AuthContext } from '../firebase/Auth';

function PostModal(props) {
    const { currentUser } = useContext(AuthContext);
    const [modalTitle, setModalTitle] = useState(undefined);
    const [modalBody, setModalBody] = useState(undefined);
    const [show, setShow] = useState(false);
    const [commentDetails, setCommentDetails] = useState([]);
    const [adminStatus, setAdminStatus] = useState(false);

    useEffect(() => {
        setModalTitle(props.post.title);
        setModalBody(props.post.body);
        async function fetchPostData() {
            try {
                const {data} = await axios.get(`http://localhost:3001/data/user/email/${currentUser.email}`);
                setAdminStatus(true);
            } catch (error) {
                console.log(error);
            }
        }
        fetchPostData();
    }, [props.post.title, props.post.body, currentUser.email]);

    const handleClose = () => { //Set modal show state to false
        setShow(false);
    }

    const handleShow = async () => { //Set current post data to display in the modal
        let { data } = await axios.get(`http://localhost:3001/data/post/${props.post._id}`);
        console.log(data.comments);
        let commentsArray = [];

        for (let index in data.comments) {
            let commentData  = await axios.get(`http://localhost:3001/data/comment/${data.comments[index]}`);
            let commentID = commentData.data._id;
            let commentbody = commentData.data.body;
            let userData = await axios.get(`http://localhost:3001/data/user/${commentData.data.userID}`);
            let commentObject = {
                "id": commentID,
                "userID": commentData.data.userID,
                "name": userData.data.userName,
                "commentBody": commentbody,
                "postID": props.post._id
            };
            commentsArray.push(commentObject);
        }
        setCommentDetails(commentsArray);
        setShow(true);
    }

    const handleResolve = async () => {
        await axios.patch(`http://localhost:3001/data/post/resolve/${props.post._id}`);
        props.action();
    }

    let resolve_button = null;
    if (adminStatus) {
        resolve_button = <div><Button variant="success" className="resolveButton" size="sm" onClick={handleResolve} > Resolve Post </Button></div>;
    }

    return (
        <div>
            <Button size="sm" className="postDetailsButton" variant="primary" onClick={() => { handleShow(props.post) }} >
                Post Details
            </Button>
            {resolve_button}
            <Modal show={show} onHide={handleClose} animation={false} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton id="modalTitle">
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {modalBody}
                    <br></br>
                    <br></br>
                    <SubmitComment post={props.post} userID = {props.userID} action={handleShow} allComments = {commentDetails}/>
                    <CommentList allComments={commentDetails} currentUserID = {props.userID} action={handleShow} />
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