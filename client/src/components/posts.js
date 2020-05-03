import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Modal, Button } from 'react-bootstrap';

/**
 * @author Shiwani Deo
 * @version 1.0
 * @date 05/03/2020
 */
const PostsList = (props) => {
    let card = null;
    const [postList, setPostList] = useState(undefined);

    useEffect(
        () => {
            async function fetchData() {
                try {
                    const { data } = await axios.get('http://localhost:3001/data/post/');
                    setPostList(data);
                } catch (error) {
                    console.log(error);
                }
            }
            fetchData();
        },
        [postList]
    );

    const buildListItem = (post) => {
        var postDetails = post.body.slice(0, 140) + '...';
        return (
            <div className="post"> 
                <Col lg={4} key={post._id}>
                    <Card style={{ width: '18rem' }} className="postCard">
                        <Card.Header className="cardTitle">{post.title}</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {postDetails}
                            </Card.Text>
                            <Button variant="primary">
                                Post Details
                            </Button>
                        </Card.Body>
                        <Card.Footer className="username">Posted by: {post.username}</Card.Footer>
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
        <div className="postListing">
            <Container>
                <Row>
                    {card}
                </Row>
            </Container>
        </div>
    );
}


export default PostsList;