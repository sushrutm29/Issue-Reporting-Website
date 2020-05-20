import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../firebase/Auth';

function EditPostModal(props) {
    const { currentUser } = useContext(AuthContext);
    const [show, setShow] = useState(false);
    const [adminStatus, setAdminStatus] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const {data} = await axios.get(`http://localhost:3001/data/user/email/${currentUser.email}`);
                setAdminStatus(data.admin);
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, [currentUser.email]);

    const handleClose = () => { //Set modal show state to false
        setShow(false);
    }

    const handleEditShow = async () => {
        setShow(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {postTitle, postBody} = e.target.elements;

        if(postTitle.value === props.post.title && postBody.value === props.post.body){
            alert("Please enter a new title and body!");
        }else{
            const res = await axios({
                method: 'patch',
                url: `http://localhost:3001/data/post/update/${props.post._id}`,
                data: {
                    "title": postTitle.value,
                    "body": postBody.value
                }
            });
    
            handleClose();
            props.action();
        }   
    }

    let edit_button = null;
    if(adminStatus || currentUser.email === props.post.useremail){
        edit_button = <div><Button variant="primary" className="editButtonModal" size="sm" onClick={handleEditShow} >Edit Post</Button></div>
    }
    
    return (
        <div>
            {edit_button}
            <Modal show={show} onHide={handleClose} animation={false} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>
                                New Title:
                                <input
                                className="form-control"
                                required
                                name="postTitle"
                                type="text"
                                defaultValue={props.post.title}
                                />
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                New Content:
                                <input
                                className="form-control"
                                required
                                name="postBody"
                                type="text"
                                defaultValue={props.post.body}
                                />
                            </label>
                        </div>
                        <Button variant="primary" className="editButtonModal" name="submitButton" type="submit">Edit Post</Button>
                    </form>
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

export default EditPostModal;