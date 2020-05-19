import React, { useState } from 'react';
import { NavDropdown, Form, FormControl, Button, Nav } from 'react-bootstrap';
import axios from 'axios';

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 05/18/2020 
 */
const DeptAdminButtons = (props) => {
    const [newDeptName, setNewDeptName] = useState("");

    let departmentDropdown = null;

    async function createNewDept() {
        //creates a new department
        try {
            await axios({
                method: 'post',
                url: 'http://localhost:3001/data/dept',
                data: {
                    deptName: newDeptName,
                    posts: []
                },
            });
            props.action();
        } catch (error) {
            alert(error);
        }
    }

    /**
     * Deletes the current department and all the posts and comments within it.
     * 
     * @param deptName current department name.
     */
    async function deleteDept(deptName) {
        //gets current department object with deptName
        let { data } = await axios.get(`http://localhost:3001/data/dept/getDeptByName/${deptName.toLowerCase()}`);
        let currentDeptID = data._id.toString();
        //gets all posts within current department
        data = await axios.get(`http://localhost:3001/data/post/dept/${currentDeptID}`);
        let currentPosts = data.data;
        //delets all posts within the department
        for (let i = 0; i < currentPosts.length; i++) {
            console.log(`i = ${i}`);
            let currentPostID = currentPosts[i]._id.toString();
            console.log(`currentPostID = ${currentPostID}`);
            await axios.delete(`http://localhost:3001/data/post/${currentPostID}`);
        }
        //deletes the specific department
        await axios.delete(`http://localhost:3001/data/dept/${currentDeptID}`);
        props.deletionAction();
    }
    

    const buildNavDropDownItem = (dept) => {
        let url = "/dept/" + dept.deptName + "/page/1";
        let deptName = dept.deptName.charAt(0).toUpperCase() + dept.deptName.slice(1);
        return (
            <NavDropdown.Item key={dept._id} onClick= {e => { deleteDept(deptName)}}>{deptName}</NavDropdown.Item>
        );
    }

    //Use Map function to loop over department array
    if (props.deptList) {
        departmentDropdown = props.deptList && props.deptList.map((dept) => {
            return buildNavDropDownItem(dept);
        });
    }



    return (
        <div>
            <Form inline>
                <FormControl type="text" placeholder="Create" className="mr-sm-1" onChange={e => { setNewDeptName(e.target.value) }} />
                <Button variant="outline-success" onClick={createNewDept}>Create</Button>
            </Form>
            <NavDropdown title="Delete Departement" id="basic-nav-dropdown">
                {departmentDropdown}
            </NavDropdown>
        </div>
    );
}

export default DeptAdminButtons;
