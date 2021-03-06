import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import PostModal from './modal';
import { AuthContext } from '../firebase/Auth';
import EditPostModal from './editPost';

/**
 * @author Shiwani Deo, Lun-Wei Chang
 * @version 1.0
 * @date 05/03/2020 
 */
function PostsList(props) {
    const { currentUser } = useContext(AuthContext);
    let card = null;
    const [postList, setPostList] = useState(props.allPosts);
    const [postUserID, setUserID] = useState(undefined);
    const [adminStatus, setAdminStatus] = useState(false);

    const handleDelete = async (post) => {
        const res = await axios.delete(`http://localhost:3001/data/post/${post._id}`);

        if (res.status === 200) props.deletionAction();
        else alert('Deletion Failed!');
    }

    useEffect(() => {
        setPostList(props.allPosts);
        async function fetchPostData() {
            try {
                console.log(currentUser.email);
                const { data } = await axios.get(`http://localhost:3001/data/user/email/${currentUser.email}`);
                setUserID(data._id);
                setAdminStatus(data.admin);
            } catch (error) {
                console.log(error);
            }
        }
        fetchPostData();
    },
        [props.allPosts, currentUser.email]
    );

    const buildListItem = (post) => {
        var postDetails = post.body.slice(0, 140) + '...';

        return (
            <div className="post d-flex align-items-center" key={post._id}>
                <Col xl={3} lg={4} md={6} sm={6} className="cardColumn">
                    <Card className="postCard">
                        <Card.Header className="cardTitle">{post.title}</Card.Header>
                        <Card.Body className="cardBody">
                            <Card.Text className="d-flex justify-content-center">
                                {postDetails}
                            </Card.Text>
                            <EditPostModal post = {post} action={props.action}/>
                            <PostModal post={post} userID = {postUserID} action = {props.action}/>
                            {(post.useremail === currentUser.email || adminStatus) && <Button variant="danger" className="deletePostButton" size="sm" onClick={() => { handleDelete(post) }} >
                                Delete
                            </Button>}
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
    } else {
        return <p className="noPosts">No posts found!</p>
    }

    return (
        <div className="postPage">
            <h1 className="postsHeader">Posts</h1>
            <Container>
                <Row>
                    {card}
                </Row>
            </Container>
        </div>
    );
}


export default PostsList;