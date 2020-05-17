import React, { useState, useEffect, useContext } from 'react';
import PostsList from './posts';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SignOutButton from './signOut';
import Error404 from './Error404';
import { AuthContext } from '../firebase/Auth';

/**
 * @author Lun-Wei Chang
 * @version 1.0
 * @date 05/06/2020
 */
function Home(props) {
    const { currentUser } = useContext(AuthContext);
    const [postList, setPostList] = useState(undefined);
    const [currentPageNum, setPage] = useState(props.match.params.pageNo);
    const [lastPage, setLastpage] = useState(undefined);

    useEffect(() => {
        setLastpage(false); //Assume user is initially not on the last page
        async function fetchPostData() {
            try {
                setPage(props.match.params.pageNo);
                let { data } = await axios.get(`http://localhost:3001/data/post/page/${currentPageNum}`);
                setPostList(data);
                let nextPageNo = parseInt(currentPageNum) + 1;
                data = await axios.get(`http://localhost:3001/data/post/page/${nextPageNo}`); //Check if next page has any data
                if (data.data.length === 0) {
                    setLastpage(true);
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchPostData()
    }, [currentPageNum, props.match.params.pageNo]
    );

    //If no post listing or incorrect URL display 404
    if ((postList && postList.length === 0) || !Number.isInteger(parseInt(props.match.params.pageNo)) || parseInt(props.match.params.pageNo) <=0) {
        return <Error404 />;
    }

    //Update component if page number changes and offset does not update (In case of browser back button)
    if (currentPageNum !== parseInt(props.match.params.pageNo)) {
        props.match.params.pageNo = currentPageNum;
    }

    //Increment page number
    const incrementPage = () => {
        setPage(parseInt(props.match.params.pageNo) + 1);
        props.location.pathname = `/home/page/${(parseInt(props.match.params.pageNo) + 1).toString()}`;
    }

    //Decrement page number
    const decrementPage = () => {
        setPage(parseInt(props.match.params.pageNo) - 1);
        props.location.pathname = `/home/page/${(parseInt(props.match.params.pageNo) - 1).toString()}`;
    }

    //Display previous button only if user is NOT on the first page
    let prevLink;
    if (parseInt(currentPageNum) !== 1) {
        prevLink = <Link onClick={decrementPage} className="prev" to={`/home/page/${(parseInt(props.match.params.pageNo) - 1).toString()}`}>Previous</Link>;
    }

    //Display next button only if user is NOT on the last page
    let nextLink
    if (!lastPage) {
        nextLink = <Link onClick={incrementPage} className="next" to={`/home/page/${(parseInt(props.match.params.pageNo) + 1).toString()}`}>Next</Link>;
    }

    return (
        <div className="homePage">
            <PostsList allPosts={postList}/>
            {prevLink}
            {nextLink}
            <SignOutButton />
        </div>
    )
}

export default Home;
