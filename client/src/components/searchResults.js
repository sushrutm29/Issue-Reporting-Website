import React, {useState, useEffect } from 'react';
import PostsList from './posts';
import { Button} from 'react-bootstrap';

function SearchResults(props) {

    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        let postsArray = []
        let results = props.results;
        for (let index in results) {
            results[index]._source['_id'] = results[index]._source['id'];
            postsArray.push(results[index]._source);
        }
        setSearchResults(postsArray);
    }, [props.results])

    function handlePostDeletion() {
        window.location.href='/login';
    }

    function handleStatus() {
        window.location.href='/login';
    }

    function setStatus() {
        props.setPostFoundState(false);
        props.getReceivedStatus(false);
        props.reset(true);
    }

    return (
        <div className="searchResults">
            {(!props.currentResetState) && <div>
                {props.postsFound && <PostsList allPosts={searchResults} results={props.postsFound} action={handleStatus} deletionAction={handlePostDeletion}/>}
                {!(props.postsFound) && <p className="noPosts">No posts found! </p>}
                <Button variant="outline-success" onClick={setStatus}>Reset</Button>
            </div>}
        </div>
    )
}

export default SearchResults;