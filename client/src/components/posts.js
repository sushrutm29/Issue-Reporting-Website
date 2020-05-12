import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';

/**
 * @author Shiwani Deo, Lun-Wei Chang
 * @version 1.0
 * @date 05/03/2020
 */
function PostsList (props) {
    let card = null;
    const [ postList, setPostList ] = useState(props.allPosts);

    useEffect(() => {
            setPostList(props.allPosts);
        },
        [props.allPosts]
    );

    const buildListItem = (post) => {
        var postDetails = post.body.slice(0, 140) + '...';
        return (
            <div key={`post_${post._id}`} className="post">
                <Col key={post._id} lg={4}>
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