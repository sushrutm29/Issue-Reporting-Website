import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavDropdown, Navbar, Nav, Form, FormControl, Button } from 'react-bootstrap';
import CreatePost from './createIssue'
import {doSignOut} from '../firebase/FirebaseFunctions';

function NavigationBar(props) {
    let departmentDropdown = null;
    const [deptList, setDeptList] = useState(props.deptList);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data } = await axios.get(`http://localhost:3001/data/dept/`);
                setDeptList(data);
            } catch (error) {
                console.log(error)
            }
        }
        fetchData();
    },
        [deptList]
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
                </Nav>
                <Button variant="outline-success" href="#" onClick={doSignOut}>Signout</Button>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default NavigationBar;