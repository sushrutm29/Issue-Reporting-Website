import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CommentList(props) {
    const [commentList, setCommentList] = useState(props.allComments);
    let listItem = null;
    const [commentDetails, setCommentDetails] = useState([]);

    useEffect(() => {
        setCommentList(props.allComments);
        async function fetchCommentData() {
            try {
                for (let index in commentList) {
                    let { data } = await axios.get(`http://localhost:3001/data/comment/${commentList[index]}`);
                    let commentID = data._id;
                    let commentbody = data.body;
                    data = await axios.get(`http://localhost:3001/data/user/${data.userID}`);
                    let commentObject = {
                        "id": commentID,
                        "name": data.data.userName,
                        "commentBody": commentbody
                    };
                    setCommentDetails(commentDetails => commentDetails.concat(commentObject));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchCommentData();
    },
        [commentList]);

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