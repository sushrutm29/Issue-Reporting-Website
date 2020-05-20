import React, { useState, useEffect } from 'react';
import PostsList from './posts';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DonePostsList from './donePosts';
import Error404 from './Error404';
import NavigationBar from './navigation';
import { Toast, Button } from 'react-bootstrap';
import NoPosts from './noPosts';

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 05/06/2020
 */
function Home(props) {
    const [postList, setPostList] = useState(undefined);
    const [donePostList, setDonePostList] = useState(undefined);
    const [statusChanged, setStatusChanged] = useState(false);
    const [currentPageNum, setPage] = useState(props.match.params.pageNo);
    const [currentResolvedPageNum, setResolvedPage] = useState(1);
    const [lastPage, setLastpage] = useState(undefined);
    const [resolvedLastPage, setResolvedLastpage] = useState(false);
    const [deptList, setDeptList] = useState(undefined);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [receivedResults, setReceivedResults] = useState(false);
    const [sortFilter, setSortFilter] = useState("desc");
    let noPosts = null;

    useEffect(() => {
        setLastpage(false); //Assume user is initially not on the last page
        async function fetchPostData() {
            try {
                let { data } = await axios.get(`http://localhost:3001/data/post/resolvedpage/${currentResolvedPageNum}`);
                setDonePostList(data);

                data = await axios.get('http://localhost:3001/data/dept/');
                setDeptList(data.data);

                setPage(props.match.params.pageNo);
                data = await axios.get(`http://localhost:3001/data/post/page/${currentPageNum}`,
                    {
                        params: {
                            sortOrder: sortFilter
                        }
                    }
                );
                setPostList(data.data);
                let nextPageNo = parseInt(currentPageNum) + 1;
                data = await axios.get(`http://localhost:3001/data/post/page/${nextPageNo}`,
                    {
                        params: {
                            sortOrder: sortFilter
                        }
                    }
                ); //Check if next page has any data
                if (data.data.length === 0) {
                    setLastpage(true);
                }
                let nextResolvedPageNo = currentResolvedPageNum + 1;
                data = await axios.get(`http://localhost:3001/data/post/resolvedpage/${nextResolvedPageNo}`); //Check if next page has any data
                if (data.data.length === 0) {
                    setResolvedLastpage(true);
                } else {
                    setResolvedLastpage(false);
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchPostData();
    }, [currentPageNum, props.match.params.pageNo, statusChanged, receivedResults, currentResolvedPageNum, sortFilter]
    );

    function handleSortFilter(status) {
        console.log(status);
        setSortFilter(status);
    }

    function handleDeptCreation() {
        handleStatus();
        buildToast(`Successfully created department!`);
    }

    function handleDeptDeletion() {
        handleStatus();
        buildToast(`Successfully deleted department!`);
    }

    function handlePostDeletion() {
        handleStatus();
        buildToast("Issue Deleted Successfully!");
    }

    function handleStatus() {
        setStatusChanged(!statusChanged);
    }

    function handlePostCreation() {
        handleStatus();
        buildToast("Issue Posted Successfully!");
    }

    function hideToast() {
        setShowToast(false);
    }

    function buildToast(message) {
        setToastMessage(message);
        setShowToast(true);
    }

    function receivedSearchResults(status) {
        setReceivedResults(status);
    }

    //If no post listing or incorrect URL display 404\
    if (!Number.isInteger(parseInt(props.match.params.pageNo)) || parseInt(props.match.params.pageNo) <= 0) {
        return <Error404 />;
    } else if (postList && postList.length === 0) {
        noPosts = <NoPosts />;
    } else

        //Update component if page number changes and offset does not update (In case of browser back button)
        if (currentPageNum !== parseInt(props.match.params.pageNo)) {
            props.match.params.pageNo = currentPageNum;
        }

    //Increment page number
    const incrementPage = () => {
        setPage(parseInt(props.match.params.pageNo) + 1);
        props.location.pathname = `/home/page/${(parseInt(props.match.params.pageNo) + 1).toString()}`;
    }

    //Increment resolved page number
    const incrementResolvedPage = () => {
        setResolvedPage(currentResolvedPageNum + 1);
    }

    //Decrement page number
    const decrementPage = () => {
        setPage(parseInt(props.match.params.pageNo) - 1);
        props.location.pathname = `/home/page/${(parseInt(props.match.params.pageNo) - 1).toString()}`;
    }

    //Decrement resolved page number
    const decrementResolvedPage = () => {
        setResolvedPage(currentResolvedPageNum - 1);
    }

    //Display previous button only if user is NOT on the first page
    let prevLink;
    if (parseInt(currentPageNum) !== 1) {
        prevLink = <Link onClick={decrementPage} className="prev" to={`/home/page/${(parseInt(props.match.params.pageNo) - 1).toString()}`}>Previous</Link>;
    }

    //Display previous button only if user is NOT on the first resolved page
    let prevResolvedLink;
    if (currentResolvedPageNum !== 1) {
        prevResolvedLink = <Button onClick={decrementResolvedPage} className="prevResolved">Previous</Button>;
    }

    //Display next button only if user is NOT on the last page
    let nextLink
    if (!lastPage) {
        nextLink = <Link onClick={incrementPage} className="next" to={`/home/page/${(parseInt(props.match.params.pageNo) + 1).toString()}`}>Next</Link>;
    }

    //Display next button only if user is NOT on the last resolved page
    let nextResolvedLink;
    if (!resolvedLastPage) {
        if (prevResolvedLink) {
            nextResolvedLink = <Button onClick={incrementResolvedPage} className="nextResolved">Next</Button>;
        } else {
            nextResolvedLink = <Button onClick={incrementResolvedPage} className="nextResolvedNoPrev">Next</Button>;
        }
    }

    //navigation component props
    let navProps = {
        creationAction: handlePostCreation,
        getReceivedStatus: receivedSearchResults,
        createDeptAction: handleDeptCreation,
        deleteDeptAction: handleDeptDeletion,
        action: handleStatus,
        deletionAction: handlePostDeletion
    }

    return (
        <div className="homePage">
            <Toast variant="success" onClose={hideToast} show={showToast} delay={3000} autohide={true} animation={false}>
                <Toast.Header>{toastMessage}</Toast.Header>
            </Toast>
            <NavigationBar deptList={deptList} creationAction={handlePostCreation} getReceivedStatus={receivedSearchResults} {...navProps} setSortFilter={handleSortFilter} />
            <hr></hr>
            <div className="resolved">
                {!(receivedResults && donePostList) && <DonePostsList donePosts={donePostList} action={handleStatus} />}
                {!receivedResults && prevResolvedLink}
                {!receivedResults && nextResolvedLink}
            </div>
            <div  className="d-flex justify-content-center">
                <div className="unresolved">
                    {!receivedResults && <PostsList allPosts={postList} action={handleStatus} deletionAction={handlePostDeletion} />}
                    {noPosts}
                    {prevLink}
                    {nextLink}
                </div>
            </div>
        </div>
    )
}

export default Home;