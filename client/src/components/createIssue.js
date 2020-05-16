import React, { useContext, useState } from "react";
import { Modal, Button } from 'react-bootstrap';

function CreatePost(){
    const { currentUser } = useContext(AuthContext);
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
    }

    async function handleShow() { 
        setShow(true);
    }

    const buildNavDropDownItem = (dept) => {
        let deptName = dept.deptName.charAt(0).toUpperCase() + dept.deptName.slice(1);
        return (
            <NavDropdown.Item key={dept._id} href={url}>{deptName}</NavDropdown.Item>
        );
    }

    //Use Map function to loop over department array
    if (deptList) {
        departmentDropdown = deptList && deptList.map((dept) => {
            return buildNavDropDownItem(dept);
        });
    }

    return(
        <div>
            <Button variant="outline-success" onClick={handleShow}>New Post</Button>
            <Modal show={show} onHide={handleClose} animation={false} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>New Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalBody}
                    <br></br>
                    <br></br>
                    <Form>
                        <Form.Group controlId={postID}>
                            <Form.Control postid={postID} className="commentPlaceholder" type="text" name="commentBody" onChange={e => { setCommentDetails(e.target.value) }} placeholder="Enter comment" />
                        </Form.Group>
                    </Form>
                    <Button variant="secondary" size="sm" type="submit" onClick={submitComment}> Submit </Button>
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

export default CreatePost;
