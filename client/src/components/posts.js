import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col} from 'react-bootstrap';
import PostModal from './modal';
import { AuthContext } from '../firebase/Auth';

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
    const [postUserEmail, setUserEmail] = useState(undefined);

    useEffect(() => {
        setPostList(props.allPosts);
        async function fetchPostData() {
            try {
                const {data} = await axios.get(`http://localhost:3001/data/user/email/${currentUser.email}`);
                setUserID(data._id);
                setUserEmail(data.userEmail);
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
            <div className="post" key={post._id}>
                <Col lg={4}>
                    <Card style={{ width: '18rem' }} className="postCard">
                        <Card.Header className="cardTitle">{post.title}</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {postDetails}
                            </Card.Text>
                            <PostModal post={post} userID = {postUserID}/>
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

    return (
        <div className="postPage">
            <Container>
                <Row>
                    {card}
                </Row>
            </Container>
        </div>
    );
}


export default PostsList;