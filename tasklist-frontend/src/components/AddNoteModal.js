import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Spinner } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddNoteModal = ({ isOpen, toggle, taskId, handleUpdateNote }) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await handleUpdateNote(taskId, note);
            toast.success('Note added successfully!');
        } catch (error) {
            toast.error('Failed to add note.');
        } finally {
            setLoading(false);
            setNote('');
            toggle();
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>Add Note</ModalHeader>
                <ModalBody>
                    <Input
                        type="textarea"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Enter your note here"
                        disabled={loading}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <Spinner size="sm" color="light" /> : 'Save'}
                    </Button>
                    <Button color="secondary" onClick={toggle} disabled={loading}>Cancel</Button>
                </ModalFooter>
            </Modal>
            <ToastContainer />
        </>
    );
};

export default AddNoteModal;
