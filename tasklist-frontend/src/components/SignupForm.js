import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input, Container, Row, Col, Card, CardBody, CardTitle, CardHeader, Spinner, Tooltip } from 'reactstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const SignupForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const navigate = useNavigate();

    // Password requirements
    const passwordRequirements = [
        { text: 'At least 8 characters long', isValid: false },
        { text: 'Contain at least one uppercase letter', isValid: false },
        { text: 'Contain at least one lowercase letter', isValid: false },
        { text: 'Contain at least one number', isValid: false },
        { text: 'Contain at least one special character (@$!%*?&)', isValid: false },
    ];

    const [requirementsMet, setRequirementsMet] = useState(new Array(passwordRequirements.length).fill(false));

    // Function to validate password against requirements
    const validatePassword = (password) => {
        const regexUpper = /^(?=.*[A-Z])/;
        const regexLower = /^(?=.*[a-z])/;
        const regexNumber = /^(?=.*\d)/;
        const regexSpecial = /^(?=.*[@$!%*?&])/;

        const updatedRequirementsMet = passwordRequirements.map((requirement, index) => {
            switch (index) {
                case 0:
                    return { ...requirement, isValid: password.length >= 8 };
                case 1:
                    return { ...requirement, isValid: regexUpper.test(password) };
                case 2:
                    return { ...requirement, isValid: regexLower.test(password) };
                case 3:
                    return { ...requirement, isValid: regexNumber.test(password) };
                case 4:
                    return { ...requirement, isValid: regexSpecial.test(password) };
                default:
                    return requirement;
            }
        });

        setPasswordValid(updatedRequirementsMet.every((req) => req.isValid));
        setRequirementsMet(updatedRequirementsMet);
    };

    useEffect(() => {
        validatePassword(password);
    }, [password]);

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!passwordValid) {
            toast.error('Password does not meet the criteria.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('https://13.235.23.243/auth/signup', { email, password, name });
            if (response.status === 200) {
                toast.success('Signup successful. Please login.');
                navigate('/login');
            } else {
                toast.error('Signup failed');
            }
        } catch (error) {
            console.error('Signup error', error);
            toast.error('Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
    };

    const toggleTooltip = () => {
        setTooltipOpen(!tooltipOpen);
    };

    const handlePasswordFocus = () => {
        setTooltipOpen(true);
    };

    const handlePasswordBlur = () => {
        setTooltipOpen(false);
    };

    return (
        <>
            <Container className="d-flex justify-content-center align-items-center min-vh-100" style={{ marginTop: '-50px' }}>
                <Row className="w-100 justify-content-center">
                    <Col md="5" lg="5">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-primary text-white text-center">
                                <CardTitle tag="h2">Signup</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <Form onSubmit={handleSignup}>
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
                                        <Label for="name">Name</Label>
                                        <Input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="password">Password</Label>
                                        <div style={{ position: 'relative' }}>
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                value={password}
                                                onChange={handlePasswordChange}
                                                required
                                                disabled={loading}
                                                style={{ paddingRight: '40px' }}
                                                onFocus={handlePasswordFocus}
                                                onBlur={handlePasswordBlur}
                                            />
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '10px',
                                                    transform: 'translateY(-50%)',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                        </div>
                                        <Tooltip
                                            isOpen={tooltipOpen}
                                            target="password"
                                            toggle={toggleTooltip}
                                            placement="right"
                                            autohide={passwordValid}
                                            className="password-tooltip"
                                        >
                                            <ul>
                                                {passwordRequirements.map((requirement, index) => (
                                                    <li key={index} className={requirementsMet[index].isValid ? 'text-success' : 'text-danger'}>
                                                        {requirement.text}
                                                        {requirementsMet[index].isValid && <span className="ml-2">&#x2713;</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Tooltip>
                                    </FormGroup>
                                    <Button type="submit" color="primary" block disabled={loading || !passwordValid}>
                                        {loading ? <Spinner size="sm" color="light" /> : 'Signup'}
                                    </Button>
                                </Form>
                                <p className="mt-3 text-center">
                                    Already have an account? <Link to="/login">Log in</Link>
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

export default SignupForm;
