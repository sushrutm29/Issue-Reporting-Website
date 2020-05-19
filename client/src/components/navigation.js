import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NavDropdown, Navbar, Nav, Form, FormControl, Button } from 'react-bootstrap';
import CreatePost from './createIssue'
import {doSignOut} from '../firebase/FirebaseFunctions';
import { AuthContext } from '../firebase/Auth';

function NavigationBar(props) {
    let departmentDropdown = null;
    const [deptList, setDeptList] = useState(props.deptList);
    const { currentUser } = useContext(AuthContext);
    const [adminStatus, setAdminStatus] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data } = await axios.get(`http://localhost:3001/data/dept/`);
                setDeptList(data);

                const userData = await axios.get(`http://localhost:3001/data/user/email/${currentUser.email}`);
                setAdminStatus(userData.data.admin);
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    },
        [currentUser.email]
    );

    const buildNavDropDownItem = (dept) => {
        let url = "/dept/" + dept.deptName +"/page/1";
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
 
    let edit_button = null;
    if (adminStatus) {
        edit_button = 
        <div><Button variant="outline-success" onClick={() => {}} >
        Add Dept
        </Button>
        <Button variant="outline-success" onClick={() => {}} >
        Delete Dept
        </Button></div>;
    }

    if(props.creationAction){
        return (
            <Navbar bg="light" expand="lg" className="navBar">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="/home/page/1">Home</Nav.Link>
                        <Nav.Link href="#">Profile</Nav.Link>
                        <NavDropdown title="Department" id="basic-nav-dropdown">
                            {departmentDropdown}
                        </NavDropdown>
                        <Form inline>
                            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                            <Button variant="outline-success">Search</Button>
                        </Form>
                        <CreatePost action={props.creationAction}/>
                        {edit_button}
                    </Nav>
                    <Button variant="outline-success" onClick={doSignOut}>Signout</Button>
                </Navbar.Collapse>
            </Navbar>
        )
    }else{
        return (
            <Navbar bg="light" expand="lg" className="navBar">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="/home/page/1">Home</Nav.Link>
                        <Nav.Link href="#">Profile</Nav.Link>
                        <NavDropdown title="Department" id="basic-nav-dropdown">
                            {departmentDropdown}
                        </NavDropdown>
                        <Form inline>
                            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                            <Button variant="outline-success">Search</Button>
                        </Form>
                        {edit_button}
                    </Nav>
                    <Button variant="outline-success" onClick={doSignOut}>Signout</Button>
                </Navbar.Collapse>
            </Navbar>
        )
    }   
}

export default NavigationBar;