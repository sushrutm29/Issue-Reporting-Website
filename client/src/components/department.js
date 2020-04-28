import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
// import deptData from './../../../server/data/dept';
// import postData from '../server/data/posts';
import axios from "axios";


class department extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pageNotFound: false,    //boolean indicates whether page exists or not
            hasDept: true,     //indicates whether any department exists or not
            allDept: undefined,
            postData: undefined,
            hasCacheData: false,    //indicates whether the department data has been stored in Redis
            currentDept: undefined
        };
    }

    /**
     * 1. Checks if there is data in Redis server
     * stores department and posts data into Redis first if it hasn't been done already
     * 2. Uses "Custom Hook"
     * 3. 
     */

    //prevents page from reloading
    componentWillReceiveProps(props) {
        this.getAllDepts();
    }

    //
    componentDidMount() {
        this.getAllDepts();
        this.getDeptByID("5ea355671cff57118055d741");
    }

    async getDeptByID(deptID) {
        try {
            let dept_url = 'http://localhost:3001/data/dept/' + deptID;
            const singleDept = await axios.get(dept_url);
            this.setState({ currentDept: singleDept.data });
        } catch (err) {
            console.log(err);
            this.setState({ pageNotFound: true });
        }
    }

    async getAllDepts() {
        try {
            let dept_url = 'http://localhost:3001/data/dept';
            const allDepts = await axios.get(dept_url);
            let numOfDept = allDepts.data.length;
            if (numOfDept === 0) { //zero department
                this.setState({ hasDept: false });
                throw new Error("No department exits at this moment");
            }
            this.setState({ allDeptsInfo: allDepts.data });
        } catch (err) {
            console.log(err);
            this.setState({ pageNotFound: true });
        }
    }

    render() {
        let allDepts = this.state.allDeptsInfo;
        let li_tag = allDepts && allDepts.map((dept) => (
            // <li key={dept.deptName} className="cap-first-letter">{dept.deptName}</li>
            <li key={dept.deptName} className="cap-first-letter">
                {dept.posts.map((post) => (
                    <p>post ID: {post}</p>
                ))}
            </li>
        ));

        let dept01 = (
            <Card style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title>Card Title</Card.Title>
                    <Card.Text>
                        Some quick example text
                    </Card.Text>
                    <Button variant="primary">Go somewhere</Button>
                </Card.Body>
            </Card>
        );

        let html_body = (
            <div>
                <h3 className='App-title'>Department Page</h3>
                <ul className="list-unstyled">{li_tag}</ul>
                <Container>
                    <Row>
                        <Col xs={12} md={8}>
                            {dept01}
                        </Col>
                        <Col xs={12} md={8}>
                            {dept01}
                        </Col>
                        <Col xs={12} md={8}>
                            {dept01}
                        </Col>
                    </Row>
                </Container>
            </div>
        );
        return html_body;
    }
}

export default department;
