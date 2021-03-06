import React, { useContext, useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import { AuthContext } from '../firebase/Auth';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

function CreatePost(props){
    let departmentDropdown = null;
    const [deptList, setDeptList] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
    }

    async function handleShow() { 
        if(currentUser == null) return <Redirect to="/login"/>;
        setShow(true);
        const { data } = await axios.get(`http://localhost:3001/data/dept/`);
        setDeptList(data);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(currentUser == null) return <Redirect to="/login"/>;
        const { postTitle, postBody, department} = e.target.elements;

        try {
            await axios({
                method: 'post',
                url: 'http://localhost:3001/data/post',
                data: {
                    deptID: department.value,
                    title: postTitle.value,
                    body: postBody.value,
                    username: currentUser.displayName,
                    useremail: currentUser.email
                },
            });
            handleClose();
            props.action();
        } catch (error) {
            alert(error);
        }
    }

    const buildNavDropDownItem = (dept) => {
        let deptName = dept.deptName.charAt(0).toUpperCase() + dept.deptName.slice(1);
        return (
            <option key={dept._id} value={dept._id}>{deptName}</option>
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
            <Button variant="primary" onClick={handleShow} className="createPostButton">Create Post</Button>
            <Modal show={show} onHide={handleClose} animation={false} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>New Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title:
                                <input className="form-control" required name="postTitle" type="text" placeholder="Enter Title"/>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                Content:
                                <input className="form-control" required name="postBody" type="text" placeholder="Enter Content"/>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                Department:
                                <br/>
                                <select id="department" name="department" required>
                                    {departmentDropdown}
                                </select>
                            </label>
                        </div>
                        <button id="submitButton" name="submitButton" type="submit">Create Post</button>
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

export default CreatePost;
