// import axios from "axios";
// import React, { useEffect, useState } from "react";
// axios.defaults.withCredentials = true;

// const Welcome = () => {
//     const [user, setUser] = useState(null); // Initialize user to null
    
//     const sendRequest = async () => {
//         try {
//             const res = await axios.get('http://localhost:5000/api/user', {
//                 withCredentials: true
//             });
//             if (res && res.data) {
//                 return res.data;
//             } else {
//                 console.error('No data found in response');
//                 return null;
//             }
//         } catch (err) {
//             console.error('Error during HTTP request:', err);
//             return null;
//         }
//     };
    
//     useEffect(() => {
//         sendRequest().then((data) => {
//             if (data && data.user) {
//                 setUser(data.user);
//             }
//         });
//     }, []);    

//     return (
//         <div> 
//             <h1>Welcome</h1>
//             {user ? (
//                 <>
//                     <h1>{user.name}</h1>
//                     <h1>{user.name}</h1>
//                     <h1>{user.name}</h1>
//                     <h1>{user.name}</h1>
//                     <h1>{user.name}</h1>
//                 </>
//             ) : (
//                 <p>Loading....</p>
//             )}
//         </div>
//     );
// };

// export default Welcome;
