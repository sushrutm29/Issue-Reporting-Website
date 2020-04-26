import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
// import deptData from './../../../server/data/dept';
// import postData from '../server/data/posts';
import axios from "axios";


class department extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pageNotFound: false,    //boolean indicates whether page exists or not
            deptData: undefined,    //stores department data
            numOfDept: 0,
            postData: undefined,
            hasCacheData: false     //indicates whether the department data has been stored in Redis
        };
    }

    /**
     * 1. Checks if there is data in Redis server
     * stores department and posts data into Redis first if it hasn't been done already
     * 2. Uses "Custom Hook"
     * 3. 
     */

    // //prevents page from reloading
    // componentWillReceiveProps(props) {
    //     this.getPokemons(Number(props.match.params.page));
    // }

    //
    componentDidMount() {
        this.getAllDepts();
    }



    async getAllDepts() {
        console.log("@@@@@@@@@@@@@@ getAllDepts is triggered");
        try {
            // let dept_id = this.props.match.params.id;
            let dept_url = 'http://localhost:3001/data/dept';
            const allDepts = await axios.get(dept_url);
            // .then(function (response) {
            //     console.log(`response = ${response}`);
            // });
            // .catch(function (error) {
            //     // handle error
            //     console.log(`axios error = ${error}`);
            // })
            // .finally(function () {
            //     // always executed
            // });
            console.log(`%%%%%%%%%%%allDepts = ${JSON.stringify(allDepts.data.length)}`);
            let numOfDept = allDepts.data.length;
            let deptArray = new Array();
            // for (let i = 0; i < numOfDept; i++) {
            //     deptArray.push(allDepts.data[i].deptName);
            //     let currentDept = allDepts.data[i];
            //     this.setState({
            //         deptData: [ ...this.state.deptData, {
            //             'id': currentDept._id,
            //             'name': currentDept.deptName,
            //             'posts': currentDept.posts
            //         }],
            //       });
            // }
            //stores all the department name into an array
            let allDeptNames = allDepts.data.map(function (dept) {
                return dept.deptName;
            });
            let allDeptIDs = allDepts.data.map(function (dept) {
                return dept._id;
            });
            let allDeptPosts = allDepts.data.map(function (dept) {
                return dept.posts;
            });
            // this.setState({
            //     deptData: [...this.state.deptData, ...allDepts.data]
            // });
            // this.setState({ [this.state.deptData]: allDepts.data} )
            console.log(`allDeptNames = ${allDeptNames}`);
            console.log(`allDeptIDs = ${allDeptIDs}`);
            console.log(`allDeptPosts = ${allDeptPosts}`);
            console.log(`allDepts.data = ${JSON.stringify(allDepts.data)}`);
            console.log(`allDepts.data type = ${typeof (allDepts.data)}`);
            console.log(`is allDept an array = ${Array.isArray(allDepts.data)}`);
            this.setState({ deptData: allDepts.data} );
            console.log(`this.state.deptData type = ${typeof(this.state.deptData)}`);
            console.log(`############this.state.deptData = ${this.state.deptData}`);
        } catch (err) {
            console.log(err);
            this.setState({ pageNotFound: true });
        }
    }

    render() {
        let allDepts = this.state.deptData;
        // let li_tag = this.state.deptData && this.state.deptData.results.map((dept) => (
        //     <li key={dept.deptName} className="cap-first-letter">
        //         <p>{dept.deptName}</p>
        //     </li>
        // ));
        let html_body = (
            <div>
                <h3 className='App-title'>Department Page</h3>
                <p>AllDepts: {allDepts}</p>
                {/* <ul className="list-unstyled">{li_tag}</ul> */}
            </div>
        );
        return html_body;
    }
}

export default department;
