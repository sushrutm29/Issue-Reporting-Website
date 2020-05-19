import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PostsList from './posts';
import Error404 from './Error404';
import NavigationBar from './navigation';
import DonePostsList from './donePosts';
import { Button } from 'react-bootstrap';

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 05/03/2020
 */
const Department = (props) => {
    const [postList, setPostList] = useState(undefined);
    const [currentDeptName, setDept] = useState(props.match.params.deptName);
    const [currentPageNum, setPage] = useState(props.match.params.pageNo);
    const [lastPage, setLastpage] = useState(undefined);
    const [donePostList, setDonePostList] = useState(undefined);
    const [statusChanged, setStatusChanged] = useState(false);
    const [resolvedLastPage, setResolvedLastpage] = useState(false);
    const [currentResolvedPageNum, setResolvedPage] = useState(1);

    useEffect(() => {
        setDept(props.match.params.deptName);
        async function fetchPostData() {
            try {
                let currentDept = await axios.get(`http://localhost:3001/data/dept/getDeptByName/${currentDeptName}`);
                let currentDeptID = currentDept.data._id;
                
                let { data } = await axios.get(`http://localhost:3001/data/post/dept/resolved/${currentDeptID}/${currentResolvedPageNum}`);
                setDonePostList(data.filter((post) => post['resolvedStatus']));

                setPage(props.match.params.pageNo);
                data = await axios.get(`http://localhost:3001/data/post/dept/${currentDeptID}/${currentPageNum}`);
                setPostList(data.data.filter((post) => !post['resolvedStatus']));

                let nextPageNo = parseInt(currentPageNum) + 1;
                data = await axios.get(`http://localhost:3001/data/post/dept/${currentDeptID}/${nextPageNo}`); //Check if next page has any data
                if (data.data.length === 0) {
                    setLastpage(true);
                } else {
                    setLastpage(false);
                }

                let nextResolvedPageNo = currentResolvedPageNum + 1;
                data = await axios.get(`http://localhost:3001/data/post/dept/resolved/${currentDeptID}/${nextResolvedPageNo}`); //Check if next page has any data
                if (data.data.length === 0) {
                    setResolvedLastpage(true);
                }else{
                    setResolvedLastpage(false);
                }
            } catch (err) {
                console.log(err);
            }
        }
        // calTotalNumPages(props.match.params.pageNum);
        fetchPostData();    //the posts within the current department
    }, [currentDeptName, props.match.params.deptName, currentPageNum, props.match.params.pageNo, statusChanged, currentResolvedPageNum]);

    function handleStatus(){
        setStatusChanged(!statusChanged);
    }

    //If no post listing or incorrect URL display 404
    if ((postList && postList.length === 0) || !Number.isInteger(parseInt(props.match.params.pageNo)) || parseInt(props.match.params.pageNo) <=0) {
        return <Error404 />;
    }

    //Increment page number
    const incrementPage = () => {
        setPage(currentPageNum + 1);
        props.location.pathname = `/dept/${currentDeptName}/page/${(parseInt(props.match.params.pageNo) + 1).toString()}`;
    }

    //Increment resolved page number
    const incrementResolvedPage = () => {
        setResolvedPage(currentResolvedPageNum + 1);
    }

    //Decrement page number
    const decrementPage = () => {
        setPage(currentPageNum - 1);
        props.location.pathname = `/dept/${currentDeptName}/page/${(parseInt(props.match.params.pageNo) - 1).toString()}`;
    }

    //Decrement resolved page number
    const decrementResolvedPage = () => {
        setResolvedPage(currentResolvedPageNum - 1);
    }

    //Display previous button only if user is NOT on the first page
    let prevLink;
    if (parseInt(currentPageNum) !== 1) {
        prevLink = <Link onClick={decrementPage} className="prev" to={`/dept/${currentDeptName}/page/${(parseInt(props.match.params.pageNo) - 1).toString()}`}>Previous</Link>;
    }

    //Display previous button only if user is NOT on the first resolved page
    let prevResolvedLink;
    if (currentResolvedPageNum !== 1) {
        prevResolvedLink = <Button onClick={decrementResolvedPage} className="prevResolved">Previous</Button>;
    }

    //Display next button only if user is NOT on the last page
    let nextLink
    if (!lastPage) {
        nextLink = <Link onClick={incrementPage} className="next" to={`/dept/${currentDeptName}/page/${(parseInt(props.match.params.pageNo) + 1).toString()}`}>Next</Link>;
    }

    //Display next button only if user is NOT on the last resolved page
    let nextResolvedLink;
    if (!resolvedLastPage) {
        if(prevResolvedLink){
            nextResolvedLink = <Button onClick={incrementResolvedPage} className="nextResolved">Next</Button>;
        }else{
            nextResolvedLink = <Button onClick={incrementResolvedPage} className="nextResolvedNoPrev">Next</Button>;
        }   
    }

    return (
        <div className="deptPostList">
            <NavigationBar creationAction={false}/>
            <DonePostsList donePosts={donePostList} action={handleStatus}/>
            {prevResolvedLink}
            {nextResolvedLink}
            <PostsList allPosts={postList} action={handleStatus}/>
            {prevLink}
            {nextLink}
        </div>
    );


}

export default Department;