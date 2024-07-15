import React, { useState } from 'react'
import "./components.css";
import axiosInstance from '../../services/api';
import { useNavigate } from 'react-router-dom';


const Register = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    batch: '',
    branch: ''
  });

  const { name, email, phone, batch, branch } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await axiosInstance.post('http://localhost:5000/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div className="container" >
        <div className='row justify-content-center'>
        <div className='col-md-6 col-10'>
            <div class="card">
                <div className='card-body'>
                <h2 className='card-title text-center'>Registration</h2>
                <hr />
                    <form onSubmit={onSubmit}>                           
                            <div className="input">
                                <img src='' alt=''/>
                                <input type='text'  placeholder='Name' value={name} onChange={onChange} name='name' required/>
                            </div>
                        <br></br>            
                        <div className="input">
                            <img src='' alt=''/>
                            <input type='email'  placeholder='Email id' value={email} onChange={onChange} name='email' required/>
                        </div>
                        <br></br>
                        <div className="input">
                            <img src='' alt=''/>
                            <input type='text'  placeholder='Phone' value={phone} onChange={onChange} name='phone' required/>
                        </div>
                        <br />
                        <div className="input">
                            <img src='' alt=''/>
                            <input type='text'  placeholder='Batch' value={batch} onChange={onChange} name='batch' required/>
                        </div>
                        <br></br >
                        <div className="input">
                          <img src='' alt=''/>
                          <select name='branch' value={branch} onChange={onChange} required>
                            <option value='Computer Science and Engineering'>Computer Science and Engineering</option>
                            <option value='Mechanical Engineering'>Mechanical Engineering</option>
                            <option value='Civil Engineering'>Civil Engineering</option>
                          </select>
                        </div>
                        <div className="already-registered">Already Registered? <span><a href="/login">LOGIN!</a></span></div>
                        {/* <br /> */}
                        
                        <div className="submit-container">
                            <button type='submit' className='btn btn-primary'>Register</button>
                        </div>
                    </form>
            </div>
            </div>
        </div>
    </div>
    </div>
    
  );
};

export default Register;
