import React, { useState, useEffect } from 'react';
import PostsList from './posts';
import axios from 'axios';
import DonePostsList from './donePosts';

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 05/06/2020
 */
function Home (props) {

    const [postList, setPostList] = useState(undefined);
    const [donePostList, setDonePostList] = useState(undefined);
    const [statusChanged, setStatusChanged] = useState(false);

    function handleStatus(){
        setStatusChanged(!statusChanged);
    }

    useEffect(() => {
        //gets all posts available
        async function fetchPostData() {
            try {
                const { data } = await axios.get('http://localhost:3001/data/post/');
                setPostList(data.filter((post) => !post['resolvedStatus']));
                setDonePostList(data.filter((post) => post['resolvedStatus']));
            } catch (err) {
                console.log(err); 
            }
        }
        fetchPostData()
        
    }, [statusChanged]);
    
    return (
        <div className="homePage">
            <DonePostsList donePosts={donePostList} action={handleStatus}/>
            <PostsList allPosts={postList} action={handleStatus}/>
        </div>
    )
}

export default Home;
