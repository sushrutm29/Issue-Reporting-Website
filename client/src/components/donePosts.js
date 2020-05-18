import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col} from 'react-bootstrap';

function DonePostsList(props){
    let card = null;
    const [donePostList, setDonePostList] = useState(props.donePosts);

    useEffect(() => {
            setDonePostList(props.donePosts);
        },
        [props.donePosts]
    );

    const buildListItem = (post) => {
        return (
            <div key={`post_${post._id}`} className="post">
                <Col key={post._id} lg={4}>
                    <Card style={{ width: '18rem' }} className="donePostCard">
                        <Card.Header className="cardTitle">{post.title}</Card.Header>
                        <Card.Footer className="username">Posted by: {post.username}</Card.Footer>
                    </Card>
                </Col>
            </div>
        );
    }

    if (donePostList) {
        card = donePostList && donePostList.map((post) => {
            return buildListItem(post);
        });
    }

    return(
        <div className="donePostListing">
            <h2>Resolved Posts</h2>
            <Container>
                <Row>
                    {card}
                </Row>
            </Container>
        </div>
    );
}

export default DonePostsList;