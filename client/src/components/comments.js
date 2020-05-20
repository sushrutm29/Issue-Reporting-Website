import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

function CommentList(props) {
    let listItem = null;
    const [commentDetails, setCommentDetails] = useState(props.allComments);

    useEffect(() => {
        setCommentDetails(props.allComments);
    },
        [props.allComments]
    );

    async function deleteComment(commentID, userID, postID) {
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({userID: userID, postID: postID })
        };
        const response = await fetch(`http://localhost:3001/data/comment/${commentID}`, requestOptions);
        await response.json();

        const postRequestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({cID: commentID})
        };
        const responsePost = await fetch(`http://localhost:3001/data/post/deletecom/${postID}`, postRequestOptions);
        await responsePost.json();
        props.action();
    }

    const buildListItem = (comment) => {
        if (comment.userID === props.currentUserID) { //If comment is by currently logged in user, add a delete button
            return (
                <div className="clearfix commentsDiv" key={comment.id}>
                    <li className="comment">
                        <p> <span class="commentUsername">{comment.name}:</span> {comment.commentBody} <Button variant="danger" size="sm" className="float-right deleteButton" onClick={() => { deleteComment(comment.id,props.currentUserID,comment.postID)}}>Delete</Button></p>
                        <hr></hr>
                    </li>
                </div>
            )
        } else {
            return (
                <li className="comment" key={comment.id}>
                    <p>{comment.name} {comment.commentBody}</p>
                </li>
            )
        }
    }

    if (commentDetails) {
        listItem = commentDetails && commentDetails.map((comment) => {
            return buildListItem(comment);
        });
    }

    return (
        <div className="comments">
            <ul className="list-unstyled">{listItem}</ul>
        </div>
    );


}

export default CommentList;