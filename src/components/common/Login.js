import React, { useState } from 'react';
import "../components.css";
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', formData);
            localStorage.setItem('accessToken', response.data.accessToken);
            navigate('/welcome'); // Navigate to welcome page after successful login
        } catch (err) {
            console.error(err.response.data);
            setError(err.response.data.message || 'Something went wrong');
        }
    };

    const handleForgotPasswordClick = () => {
        navigate('/forgot-password');
    };

    return (
        <div className="container">
            <div className='row justify-content-center'>
                <div className='col-md-6'>
                    <div className="card">
                        <div className='card-body'>
                            <h2 className='card-title text-center'>Login</h2>
                            <hr />
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={onSubmit}>
                                <div className="input">
                                    <input type='email' placeholder='Email id' value={email} onChange={onChange} name='email' required />
                                </div>
                                <br />
                                <div className="input">
                                    <input type='password' placeholder='Password' value={password} onChange={onChange} name='password' required />
                                </div>
                                <div className="forgot-password">
                                    Forgot Password? <span onClick={handleForgotPasswordClick} style={{ cursor: 'pointer', color: 'blue' }}>Click Here!!</span>
                                </div>
                                <div className="submit-container">
                                    <button type='submit' className='btn btn-primary'>Login</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
