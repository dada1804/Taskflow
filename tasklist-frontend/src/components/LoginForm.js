import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, Container, Row, Col, Card, CardBody, CardTitle, CardHeader, Spinner } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import 'react-toastify/dist/ReactToastify.css';
import { login } from '../api'; // Assuming login function is imported from api.js

const LoginForm = ({ setAuthenticated }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State to manage password visibility
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login(email, password);
            if (response.status === 200) {
                const token = response.data.access_token;
                const name = response.data.name;
                localStorage.setItem("token", token);
                localStorage.setItem("name", name);
                setAuthenticated(true);
                toast.success('Login successful!');
                navigate('/tasks');
            } else {
                toast.error('Login failed. Please check your credentials and try again.');
            }
        } catch (err) {
            toast.error('An error occurred. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <Container className="d-flex justify-content-center align-items-center min-vh-100" style={{ marginTop: '-50px' }}>
                <Row className="w-100 justify-content-center">
                    <Col md="5" lg="5">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-primary text-white text-center">
                                <CardTitle tag="h2">Login</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <Form onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <Label for="email">Email</Label>
                                        <Input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="password">Password</Label>
                                        <div style={{ position: 'relative' }}>
                                            <Input
                                                type={showPassword ? 'text' : 'password'} // Toggle between text and password
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '10px',
                                                    transform: 'translateY(-50%)',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={togglePasswordVisibility}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Eye icon toggle */}
                                            </span>
                                        </div>
                                    </FormGroup>
                                    <Button type="submit" color="primary" block disabled={loading}>
                                        {loading ? <Spinner size="sm" color="light" /> : 'Login'}
                                    </Button>
                                </Form>
                                <p className="mt-3 text-center">
                                    Don't have an account? <Link to="/signup">Sign up</Link>
                                </p>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <ToastContainer />
        </>
    );
};

export default LoginForm;
