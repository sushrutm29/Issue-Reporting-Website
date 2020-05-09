import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostsList from './posts';

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 05/03/2020
 */
const Department = (props) => {
    const [postList, setPostList] = useState(undefined);
    const [currentDeptName, setDept] = useState(props.match.params.deptName);
    // const [ totalNumPages, setTotal ] = useState(0);
    // const [ currentPageNum, setPage ] = useState(props.match.params.pageNum);
    // const [ curretPageURL, setURL ] = useState(undefined);
    // const [ pageNotFound, setNotFound ] = useState(false);

    useEffect(() => {
        // function calTotalNumPages(currentPageNum) {
        //     console.log(`@@@@currentPageNum = ${currentPageNum}`);
        //     setPage(currentPageNum);
        // }
        setDept(props.match.params.deptName);
        console.log(`#### Department Page Current props = ${JSON.stringify(props.match.params.deptName)}`);
        // console.log(`$$$$ currentPageNum = ${currentPageNum}`);
        async function fetchPostData() {
            try {
                // setDept(props.match.params.deptName);
                let currentDept = await axios.get(`http://localhost:3001/data/dept/getDeptByName/${currentDeptName}`);
                let currentDeptID = currentDept.data._id;
                console.log(`%%%%%%currentDeptID = ${currentDeptID}`);
                const { data } = await axios.get(`http://localhost:3001/data/post/dept/${currentDeptID}`);
                // const { data } = await axios.get('http://localhost:3001/data/post/');
                setPostList(data);
            } catch (err) {
                console.log(err);
            }
        }
        // calTotalNumPages(props.match.params.pageNum);
        fetchPostData();    //the posts within the current department
    }, [currentDeptName, props.match.params.deptName, postList]);

    // let nextPage = <li><Link to={curretPageURL}>Next Page</Link></li>;

    // let previousPage = <li><Link to={curretPageURL}>Previous Page</Link></li>;

    // console.log(`outside currentDeptName = ${currentDeptName}`);

    return (
        <div className="deptPostList">
            <PostsList allPosts={postList}/>
            {/* <Route path='/posts' render={(props) => <PostsList {...props} allPosts={postList} />}/> */}
        </div>
    );


}

export default Department;