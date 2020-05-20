import '../App.css';
import React from 'react';
import { Button } from 'react-bootstrap';

const Error404 = () => {
    return (
        <div className="errorPage d-flex justify-content-center">
            <div class="centerError">
                <h1 className="error">Error 404, Page not found.</h1>
                <Button id="goBackButton" href="/home/page/1">Go back</Button>
            </div>
        </div>
    )
}

export default Error404;
