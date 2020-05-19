import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NavDropdown, Navbar, Nav, Form, FormControl, Button } from 'react-bootstrap';
import CreatePost from './createIssue'
import { doSignOut } from '../firebase/FirebaseFunctions';
import { AuthContext } from '../firebase/Auth';
import SearchResults from './searchResults';

function NavigationBar(props) {
    let departmentDropdown = null;
    const [deptList, setDeptList] = useState(undefined);
    const { currentUser } = useContext(AuthContext);
    const [adminStatus, setAdminStatus] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(undefined);
    const [resetState, setReset] = useState(undefined);
    const [postsFound, setPostsFound] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const deptListing = await axios.get(`http://localhost:3001/data/dept/`);
                setDeptList(deptListing.data);

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
        let url = "/dept/" + dept.deptName + "/page/1";
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
            <div><Button variant="outline-success" onClick={() => { }} >
                Add Dept
                 </Button>
                <Button variant="outline-success" onClick={() => { }} >
                    Delete Dept
                </Button>
            </div>;
    }

    function setResetState(status) {
        setReset(status);
    }

    function setPostFoundState(status) {
        setPostsFound(status);
    }

    function setPostVariables (postsArray) {
        if (postsArray.length !== 0) {
            setPostsFound(true);
            props.getReceivedStatus(true);
        } else {
            setPostsFound(false);
        }
    }

    async function submitSearchQuery() {
        console.log(searchQuery);
        setReset(false);
        let currentDepartmentID;
        if (props.currentDept !== undefined) {
            currentDepartmentID = (await axios.get(`http://localhost:3001/data/dept/getDeptByName/${props.currentDept}`)).data._id;
            const response = await axios.get("http://localhost:3001/data/post/elasticsearch/dept/",
                {
                    params: {
                        keyword: searchQuery,
                        departmentID: currentDepartmentID
                    }
                }
            );
            setSearchResults(response.data);
            setPostVariables (response.data);
        } else {
            const response = await axios.get("http://localhost:3001/data/post/elasticsearch/home/",
                {
                    params: {
                        keyword: searchQuery
                    }
                }
            );
            setSearchResults(response.data);
            setPostVariables (response.data);
        }
    }

    return (
        <div>
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
                            <FormControl type="text" placeholder="Search" className="mr-sm-2" onChange={e => { setSearchQuery(e.target.value) }} />
                            <Button variant="outline-success" onClick={submitSearchQuery}>Search</Button>
                        </Form>
                        {props.creationAction && <CreatePost action={props.creationAction} />}
                        {edit_button}
                    </Nav>
                    <Button variant="outline-success" onClick={doSignOut}>Signout</Button>
                </Navbar.Collapse>
            </Navbar>
            {searchResults && <SearchResults results={searchResults} deptName={props.currentDept} getReceivedStatus={props.getReceivedStatus} reset={setResetState} currentResetState={resetState} postsFound={postsFound} setPostFoundState={setPostFoundState}/>}
        </div>
    )
}

export default NavigationBar;