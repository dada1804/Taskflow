import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Spinner } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchContactPersons } from '../api';

const EditModal = ({ isOpen, toggle, task, onUpdate, currentUser }) => {
    const [editedTask, setEditedTask] = useState({
        id: task.id,
        entity_name: task.entity_name,
        task_type: task.task_type,
        time_of_task: new Date(task.time_of_task).toISOString().slice(0, 16),
        contact_person: task.contact_person,
        contact_person_id: task.contact_person_id,
        note: task.note,
        status: task.status,
        user_id: task.user_id
    });

    const [contactPersons, setContactPersons] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Fetch all contact persons when the modal is opened
            fetchContactPersons().then(data => {
                const filteredPersons = data.filter(person => person.name !== currentUser.name);
                setContactPersons(filteredPersons);
            });
        }
    }, [isOpen, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedTask(prevState => ({
            ...prevState,
            [name]: value
        }));

        if (name === 'contact_person') {
            const selectedPerson = contactPersons.find(person => person.name === value);
            if (selectedPerson) {
                setEditedTask(prevTask => ({
                    ...prevTask,
                    contact_person_id: selectedPerson.id,
                }));
            } else {
                setEditedTask(prevTask => ({
                    ...prevTask,
                    contact_person_id: '', // Reset ID if no person is selected
                }));
            }
        }
    };

    const handleSubmit = () => {
        setLoading(true);
        try {
            onUpdate(editedTask);
            setLoading(false);
            toast.success('Task updated successfully!');
        } catch (error) {
            console.error('Error updating task', error);
            setLoading(false);
            toast.error('Failed to update task.');
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>Edit Task</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="entity_name">Entity Name</Label>
                        <Input type="text" name="entity_name" id="entity_name" value={editedTask.entity_name} onChange={handleChange} disabled={loading} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="task_type">Task Type</Label>
                        <Input type="select" name="task_type" id="task_type" value={editedTask.task_type} onChange={handleChange} disabled={loading}>
                            <option value="">Select Task Type</option>
                            <option value="Call">📞 Call</option>
                            <option value="Video Call">📹 Video Call</option>
                            <option value="Meeting">📅 Meeting</option>
                            <option value="Other">🔗 Other</option>
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label for="time_of_task">Date and Time of Task</Label>
                        <Input type="datetime-local" name="time_of_task" id="time_of_task" value={editedTask.time_of_task} onChange={handleChange} disabled={loading} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="contact_person">Contact Person</Label>
                        <Input type="select" name="contact_person" id="contact_person" value={editedTask.contact_person} onChange={handleChange} disabled={loading}>
                            <option value="">Select Contact Person</option>
                            {contactPersons.map(person => (
                                <option key={person.id} value={person.name}>{person.name}</option>
                            ))}
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label for="note">Note</Label>
                        <Input type="textarea" name="note" id="note" value={editedTask.note} onChange={handleChange} disabled={loading} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="status">Status</Label>
                        <Input type="select" name="status" id="status" value={editedTask.status} onChange={handleChange} disabled={loading}>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                        </Input>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmit} disabled={loading || !editedTask.entity_name || !editedTask.task_type || !editedTask.time_of_task || !editedTask.contact_person || !editedTask.status}>
                        {loading ? <Spinner size="sm" color="light" /> : 'Save'}
                    </Button>
                    <Button color="secondary" onClick={toggle} disabled={loading}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <ToastContainer />
        </>
    );
};

export default EditModal;
