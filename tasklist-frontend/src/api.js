import axios from 'axios';


const API_URL = 'https://13.235.23.243/tasks';
const AUTH_URL = 'https://13.235.23.243/auth'

const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const fetchTasks = (page = 1, perPage = 10) => axios.get(`${API_URL}/all-tasks`, {
    ...getConfig(),
    params: { page, per_page: perPage }
});

export const fetchMyTasks = (page = 1, perPage = 10) => axios.get(`${API_URL}/my-tasks`, {
    ...getConfig(),
    params: { page, per_page: perPage }
});

export const createTask = (task) => axios.post(`${API_URL}/create-task`, task, getConfig());
export const duplicateTask = (task) => axios.post(`${API_URL}/duplicate-task`, task, getConfig());
export const updateTask = (id, updatedTask) => axios.put(`${API_URL}/update/${id}`, updatedTask, getConfig());
export const deleteTask = (id) => axios.delete(`${API_URL}/delete/${id}`, getConfig());
export const fetchContactPersons = async (searchTerm = '') => {
    const response = await axios.get(`${API_URL}/contact-persons`,getConfig());
    return response.data;
};
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, { email, password });
        console.log("Response in api.js", response)
        return response; // Assuming the response contains token or user data
    } catch (error) {
        throw error; // Propagate the error back to the caller for handling
    }
};

export const signup = (email, password, name) => axios.post(`${AUTH_URL}/signup`,email,name,password);