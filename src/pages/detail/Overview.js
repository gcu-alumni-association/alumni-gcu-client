import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

const Overview = () => {
    return (
        <div className='container main-header'>
            <h2 className='text-center'>Overview</h2>
            <div className="row justify-content-center mt-5">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Card Title</h5>
                            <p className="card-text">
                                This is some text within a card body. You can use this space to provide an overview of the content.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Overview;

