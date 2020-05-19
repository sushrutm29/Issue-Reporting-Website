import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PostsList from './posts';
import Error404 from './Error404';
import NavigationBar from './navigation';
import DonePostsList from './donePosts';
import { Toast } from 'react-bootstrap';

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 05/03/2020
 */
const Department = (props) => {
    const [postList, setPostList] = useState(undefined);
    const [currentPageNum, setPage] = useState(props.match.params.pageNo);
    const [lastPage, setLastpage] = useState(undefined);
    const [donePostList, setDonePostList] = useState(undefined);
    const [statusChanged, setStatusChanged] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [deptList, setDeptList] = useState(undefined);
    const [receivedResults, setReceivedResults] = useState(false);

    useEffect(() => {
        async function fetchPostData() {
            try {
                let currentDept = await axios.get(`http://localhost:3001/data/dept/getDeptByName/${props.match.params.deptName}`);
                let currentDeptID = currentDept.data._id;
    
                let { data } = await axios.get(`http://localhost:3001/data/post/dept/${currentDeptID}`);
                setDonePostList(data.filter((post) => post['resolvedStatus']));
    
                data = await axios.get(`http://localhost:3001/data/post/dept/${currentDeptID}/${currentPageNum}`);
                setPostList(data.data.filter((post) => !post['resolvedStatus']));
    
                let nextPageNo = parseInt(currentPageNum) + 1;
                data = await axios.get(`http://localhost:3001/data/post/dept/${currentDeptID}/${nextPageNo}`); //Check if next page has any data
                
                if (data.data.length === 0) {
                    setLastpage(true);
                } else {
                    setLastpage(false);
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchPostData();
    }, [statusChanged, props.match.params.deptName, currentPageNum, receivedResults]);

    function handlePostDeletion(){
        handleStatus();
        buildToast("Issue Deleted Successfully!");
    }

    function hideToast(){
        setShowToast(false);
    }

    function buildToast(message){
        setToastMessage(message);
        setShowToast(true);
    }

    function handleStatus(){
        setStatusChanged(!statusChanged);
    }

    function receivedSearchResults(status) {
        setReceivedResults(status);
    }

    //If no post listing or incorrect URL display 404
    if ((postList && postList.length === 0) || !Number.isInteger(parseInt(props.match.params.pageNo)) || parseInt(props.match.params.pageNo) <= 0) {
        return <Error404 />;
    }

    //Increment page number
    const incrementPage = () => {
        setPage(currentPageNum + 1);
        props.location.pathname = `/dept/${props.match.params.deptName}/page/${(parseInt(props.match.params.pageNo) + 1).toString()}`;
    }

    //Decrement page number
    const decrementPage = () => {
        setPage(currentPageNum - 1);
        props.location.pathname = `/dept/${props.match.params.deptName}/page/${(parseInt(props.match.params.pageNo) - 1).toString()}`;
    }

    //Display previous button only if user is NOT on the first page
    let prevLink;
    if (parseInt(currentPageNum) !== 1) {
        prevLink = <Link onClick={decrementPage} className="prev" to={`/dept/${props.match.params.deptName}/page/${(parseInt(props.match.params.pageNo) - 1).toString()}`}>Previous</Link>;
    }

    //Display next button only if user is NOT on the last page
    let nextLink
    if (!lastPage) {
        nextLink = <Link onClick={incrementPage} className="next" to={`/dept/${props.match.params.deptName}/page/${(parseInt(props.match.params.pageNo) + 1).toString()}`}>Next</Link>;
    }

    return (
        <div className="deptPostList">
            <Toast variant="success" onClose={hideToast} show={showToast} delay={3000} autohide={true} animation={false}>
                <Toast.Header>{toastMessage}</Toast.Header>
            </Toast>
            <NavigationBar creationAction={false} deptListing={deptList} currentDept={props.match.params.deptName} getReceivedStatus={receivedSearchResults}/>
            {!receivedResults && <DonePostsList donePosts={donePostList} action={handleStatus} />}
            {!receivedResults && <PostsList allPosts={postList} action={handleStatus} deletionAction={handlePostDeletion}/>}
            {prevLink}
            {nextLink}
        </div>
    );


}

export default Department;