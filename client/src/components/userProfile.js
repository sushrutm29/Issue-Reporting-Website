import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import axios from 'axios';

class userProfile extends Component {
    constructor(props) {
        super(props);
        this.state = { userData: undefined, posts: undefined };
    }

    async getUserDetails() {
        try {
            let { data } = await axios.get(`http://localhost:3001/data/user/5e8d57d8a0890e28c5bdd2a0`);
            let postIds = data.posts;
            let posts = [];
            for (const id of postIds) {
                let post = await axios.get(`http://localhost:3001/data/post/${id}`);
                posts.push(post.data)
            }
            this.setState({ userData: data, posts: posts });
        } catch (error) {

        }
    }

    componentDidMount() {
        this.getUserDetails();
    }

    render() {
        let html_body = (
            <div>
                Username : {(this.state.userData && this.state.userData.userName) || " No Username available Here :( "}
                <br />
                User's Email : {(this.state.userData && this.state.userData.userEmail) || " No User email available Here :( "}
                <br />
                Posts :  {this.state.posts && this.state.posts.map((post) => (
                        <li key={post.title}>
                            {post.title}
                            <br/>
                            {/* Resolved Status :  */}
                            {post.deptID}
                        </li>
                    ))}
                <Switch>
                    {/* <Route path="" exact component={} /> */}
                </Switch>
            </div>
        );
        return html_body;
    }
}


export default userProfile;
