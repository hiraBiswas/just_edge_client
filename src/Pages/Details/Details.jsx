import React, { useContext } from 'react';
import { AuthContext } from '../../Providers/AuthProvider';
import { useLoaderData } from 'react-router-dom';

const Details = () => {
    const { user, signIn, loading } = useContext(AuthContext);
    const courseDetails = useLoaderData();
    console.log(courseDetails)
    const {} = courseDetails;
 
    return (
        <div>

            <h4>It is details page</h4>
            
        </div>
    );
};

export default Details;