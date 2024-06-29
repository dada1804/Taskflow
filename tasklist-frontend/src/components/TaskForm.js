import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Spinner } from 'reactstrap';
import { createTask, fetchContactPersons } from '../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { fetchTasks } from '../api'; // Import fetchTasks from your API file

const TaskForm = () => {
    const [isOpen, setIsOpen] = useState(true); // State to manage modal open/close
    const [task, setTask] = useState({
        entity_name: '',
        task_type: '',
        time_of_task: '',
        contact_person: '',
        contact_person_id: '',
        note: '',
        status: 'open',
    });
    const [contactPersons, setContactPersons] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchContactPersons().then(data => {
            setContactPersons(data);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask(prevTask => ({
            ...prevTask,
            [name]: value,
        }));

        if (name === 'contact_person') {
            const selectedPerson = contactPersons.find(person => person.name === value);
            if (selectedPerson) {
                setTask(prevTask => ({
                    ...prevTask,
                    contact_person_id: selectedPerson.id,
                }));
            } else {
                setTask(prevTask => ({
                    ...prevTask,
                    contact_person_id: '',
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await createTask(task);
            if (response.status === 200) {
                toast.success('Task created successfully!');
                fetchTasks(); // Assuming this function fetches tasks and is imported correctly
                setIsOpen(false); // Close modal upon successful task creation
                navigate('/tasks'); // Navigate to /tasks
            } else {
                toast.error('Failed to create task.');
            }
        } catch (error) {
            console.error('Error creating task', error);
            toast.error('Failed to create task.');
        } finally {
            setLoading(false);
        }
    };

    const getMinDate = () => {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        return today.toISOString().slice(0, 16);
    };

    const getMaxDate = () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 2);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    };

    const toggle = () => {setIsOpen(!isOpen); navigate('/tasks');}

    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>Create New Task</ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="entity_name">Entity Name</Label>
                            <Input type="text" name="entity_name" id="entity_name" onChange={handleChange} value={task.entity_name} required disabled={loading} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="task_type">Task Type</Label>
                            <Input type="select" name="task_type" id="task_type" onChange={handleChange} value={task.task_type} required disabled={loading}>
                                <option value="">Select Task Type</option>
                                <option value="Call">&#128222; Call</option>
                                <option value="Video Call">&#128250; Video Call</option>
                                <option value="Meeting">&#128197; Meeting</option>
                                <option value="Other">&#128279; Other</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label for="time_of_task">Date and Time of Task</Label>
                            <Input type="datetime-local" name="time_of_task" id="time_of_task" min={getMinDate()} max={getMaxDate()} onChange={handleChange} value={task.time_of_task} required disabled={loading} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="contact_person">Contact Person</Label>
                            <Input type="select" name="contact_person" id="contact_person" onChange={handleChange} value={task.contact_person} required disabled={loading}>
                                <option value="">Select Contact Person</option>
                                {contactPersons.map(person => (
                                    <option key={person.id} value={person.name}>{person.name}</option>
                                ))}
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label for="note">Note</Label>
                            <Input type="textarea" name="note" id="note" onChange={handleChange} value={task.note} disabled={loading} />
                        </FormGroup>
                        <Button type="submit" color="primary" block disabled={loading}>
                            {loading ? <Spinner size="sm" color="light" /> : 'Add Task'}
                        </Button>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle} disabled={loading}>Cancel</Button> {/* Close button in modal footer */}
                </ModalFooter>
            </Modal>
            <ToastContainer />
        </>
    );
};

export default TaskForm;
