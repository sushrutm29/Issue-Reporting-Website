import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CommentList(props) {
    let listItem = null;
    const [commentDetails, setCommentDetails] = useState(props.allComments);

    useEffect(() => {
        console.log(props.allComments);
        setCommentDetails(props.allComments);
    },
        [props.allComments]
    );

    const buildListItem = (comment) => {
        return (
            <li className="comment" key={comment.id}>
                <p>{comment.name} {comment.commentBody}</p>
            </li>
        );
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