import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import CommentList from './comments';

function SubmitComment(props) {
    const [comment, setComment] = useState("");
    const [postUserID, setUserID] = useState(props.userID);
    const [commentList, setCommentList] = useState(props.allComments);

    useEffect(() => {
        setCommentList(props.allComments);
        setUserID(props.userID);
    }, []
    )

    async function submitComment() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentBody: comment, userID: postUserID, postID: props.post._id })
        };
        const response = await fetch('http://localhost:3001/data/comment/', requestOptions);
        await response.json();
        props.action();
    }

    const setCommentDetails = (commentBody) => { //Link comment to Post ID
        setComment(commentBody);
    }

    return (
        <div className="submitForm">
            <Form>
                <Form.Group controlId={props.post._id}>
                    <Form.Control postid={props.post._id} className="commentPlaceholder" type="text" name="commentBody" onChange={e => { setCommentDetails(e.target.value) }} placeholder="Enter comment" />
                </Form.Group>
            </Form>
            <Button variant="secondary" size="sm" type="submit" onClick={submitComment}> Submit </Button>
        </div>
    )

}

export default SubmitComment;
