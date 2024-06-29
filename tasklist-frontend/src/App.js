import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Navbar from './components/Navbar';
import { fetchTasks, fetchMyTasks } from './api';
import './App.css'; // Import the CSS file

const App = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(true); // State to manage TaskForm modal
   
    const toggleTaskForm = () => {
        setIsTaskFormOpen(!isTaskFormOpen);
        
    };

    return (
        <div className="bg-image">
            <Router>
                <Navbar authenticated={authenticated} setAuthenticated={setAuthenticated} />
                <div className="content">
                    <Routes>
                        <Route path="/login" element={<LoginForm setAuthenticated={setAuthenticated} />} />
                        <Route path="/signup" element={<SignupForm />} />
                        <Route
                            path="/tasks"
                            element={authenticated ? <TaskList fetchData={fetchTasks} currentUser={{ name: 'John Doe' }} viewMyTasks={false} /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/tasks/new"
                            element={authenticated ? <TaskForm/> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/mytasks"
                            element={authenticated ? <TaskList fetchData={fetchMyTasks} currentUser={{ name: 'John Doe' }} viewMyTasks={true} /> : <Navigate to="/login" />}
                        />
                        <Route path="/" element={<Navigate to="/tasks" />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
};

export default App;
