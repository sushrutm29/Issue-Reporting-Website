import React, { useState, useEffect } from 'react';
import PostsList from './posts';
import axios from 'axios';

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 05/06/2020
 */
function Home (props) {

    const [postList, setPostList] = useState(undefined);

    useEffect(() => {
        //gets all posts available
        async function fetchPostData() {
            try {
                const { data } = await axios.get('http://localhost:3001/data/post/');
                setPostList(data);
            } catch (err) {
                console.log(err); 
            }
        }
        fetchPostData()
    }, []);

    return (
        <div className="homePage">
            <PostsList allPosts={postList}/>
        </div>
    )
}

export default Home;
