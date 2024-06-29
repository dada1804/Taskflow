import React, { useState, useMemo, useEffect } from 'react';
import { updateTask, deleteTask, fetchMyTasks, duplicateTask } from '../api';
import { Table, Button, Pagination, PaginationItem, PaginationLink, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Container, Row, Col, Spinner, Tooltip, Modal, ModalBody } from 'reactstrap';
import AddNoteModal from './AddNoteModal';
import TaskForm from './TaskForm';
import EditModal from './EditModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TaskList.css'; // Import custom CSS

const TaskList = ({ fetchData, currentUser, viewMyTasks }) => {
    const [tasks, setTasks] = useState([]);
    const tasksPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterConfig, setFilterConfig] = useState({});
    const [dropdownOpen, setDropdownOpen] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedTask, setEditedTask] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [hoveredTaskId, setHoveredTaskId] = useState(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteContent, setNoteContent] = useState('');

    useEffect(() => {
        fetchTasksData();
    }, [viewMyTasks, currentPage]);

    const fetchTasksData = async () => {
        setLoading(true);
        try {
            const response = viewMyTasks ? await fetchData(currentPage, tasksPerPage) : await fetchData(currentPage, tasksPerPage);
            console.log("Tasks are", response.data.tasks)
            setTasks(response.data.tasks);
            setTotalPages(response.data.pages);
        } catch (error) {
            toast.error('Failed to fetch tasks.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = (id) => {
        setDropdownOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await deleteTask(id);
            toast.success('Task deleted successfully.');
            fetchTasksData()
        } catch (error) {
            toast.error('Failed to delete task.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, status) => {
        setLoading(true);
        try {
            await updateTask(id, { status });
            fetchTasksData();
            toast.success('Task updated successfully.');
        } catch (error) {
            toast.error('Failed to update task.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditTask = (task) => {
        setEditedTask(task);
        setIsEditModalOpen(true);
    };

    const handleDuplicate = async (task) => {
        setLoading(true);
        try {
            const currentTime = new Date();
            const taskTime = new Date(task.time_of_task);
            if (taskTime < currentTime) {
                toast.error('Cannot duplicate past tasks.');
                return;
            }

            const newTaskData = {
                entity_name: task.entity_name,
                task_type: task.task_type,
                time_of_task: new Date(task.time_of_task).toISOString(),
                contact_person: task.contact_person,
                note: task.note,
                status: task.status,
                user_id: task.user_id
            };

            await duplicateTask(newTaskData);
            fetchTasksData();
            toast.success('Task duplicated successfully.');
        } catch (error) {
            toast.error('Failed to duplicate task.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (key, value) => {
        setFilterConfig((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    const handleUpdateTask = async (updatedTask) => {
        setIsUpdating(true);
        try {
            await updateTask(updatedTask.id, updatedTask);
            fetchTasksData();
            toast.success('Task updated successfully.');
        } catch (error) {
            toast.error('Failed to update task.');
        } finally {
            setIsUpdating(false);
            setIsEditModalOpen(false);
        }
    };

    const handleUpdateNote = async (taskId, note) => {
        setLoading(true);
        try {
            const response = await updateTask(taskId, { note });
            fetchTasksData();
            toast.success(response.message);
        } catch (error) {
            toast.error('Failed to update note.');
        } finally {
            setLoading(false);
        }
    };

    const openAddNoteModal = (taskId) => {
        setSelectedTaskId(taskId);
        setIsModalOpen(true);
    };

    const closeTaskForm = () => {
        setIsTaskFormOpen(false);
    };

    const filteredTasks = useMemo(() => {
        let filteredTasks = tasks;

        Object.keys(filterConfig).forEach((key) => {
            if (filterConfig[key]) {
                filteredTasks = filteredTasks.filter((task) => task[key] === filterConfig[key]);
            }
        });

        return filteredTasks;
    }, [tasks, filterConfig]);

    const renderFilterIcon = (column) => {
        return (
            <Dropdown isOpen={dropdownOpen[column]} toggle={() => toggleDropdown(column)} className="d-inline-block">
                <DropdownToggle caret>
                    <i className="fas fa-filter" />
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={() => handleFilter(column, null)}>All</DropdownItem>
                    {uniqueValues(column)?.map(value => (
                        <DropdownItem key={value} onClick={() => handleFilter(column, value)}>
                            {value}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>
        );
    };

    const uniqueValues = (key) => {
        return [...new Set(tasks?.map(task => task[key]))];
    };

    const renderTaskRow = (task) => {
        const taskRowId = `task-row-${task.id}`;
        return (
            <tr id={taskRowId} key={task.id} className="task-row"
                onMouseEnter={() => setHoveredTaskId(task.id)}
                onMouseLeave={() => setHoveredTaskId(null)}>
                <td>{task.entity_name}</td>
                <td>
                    {task.task_type === 'Call' && <i className="fas fa-phone-alt"></i>}
                    {task.task_type === 'Video Call' && <i className="fas fa-video"></i>}
                    {task.task_type === 'Meeting' && <i className="fas fa-users"></i>}
                    {task.task_type === 'Other' && <i className="fas fa-tasks"></i>}
                    &nbsp;{task.task_type}
                </td>
                <td>{new Date(task.time_of_task).toLocaleString()}</td>
                <td>{task.contact_person}</td>
                <td>
                    {task.note ? (
                        <>
                            {task.note.length > 20 ? (
                                <>
                                    {task.note.substring(0, 20)}...&nbsp;
                                    <Button color="link" onClick={() => {
                                        setNoteContent(task.note);
                                        setIsNoteModalOpen(true);
                                    }} style={{ textDecoration: 'none', padding: '0', cursor: 'pointer', color: '#007bff' }}>more</Button>
                                </>
                            ) : (
                                task.note
                            )}
                        </>
                    ) : (
                        <Button color="link" onClick={() => openAddNoteModal(task.id)} style={{ textDecoration: 'none', padding: '0', cursor: 'pointer', color: '#007bff' }}>ADD NOTE</Button>
                    )}
                </td>
                <td>{task.status}</td>
                <td>
                    <Dropdown isOpen={dropdownOpen[task.id]} toggle={() => toggleDropdown(task.id)}>
                        <DropdownToggle caret>
                            Options
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => handleDuplicate(task)}>Duplicate Task</DropdownItem>
                            <DropdownItem onClick={() => handleEditTask(task)}>Edit Task</DropdownItem>
                            {task.status === 'open' && (
                                <DropdownItem onClick={() => handleUpdate(task.id, 'closed')}>Change Status to Closed</DropdownItem>
                            )}
                            <DropdownItem onClick={() => handleDelete(task.id)}>Delete Task</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </td>
                {hoveredTaskId === task.id && (
                    <Tooltip
                        placement="top"
                        isOpen={true}
                        target={taskRowId}
                        toggle={() => setHoveredTaskId(null)}
                    >
                        Status: {task.status}
                    </Tooltip>
                )}
            </tr>
        );
    };

    return (
        <Container className='mt-2'>
            <Row className="mb-3">
            </Row>
            {isTaskFormOpen && (
                <TaskForm
                    isOpen={isTaskFormOpen}
                    toggle={closeTaskForm}
                    fetchTasks={fetchTasksData}
                    currentUser={currentUser}
                />
            )}
            {loading ? (
                <div className="d-flex justify-content-center align-items-center vh-50">
                    <Spinner color="primary" style={{ width: '5rem', height: '5rem' }} />
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center vh-50">
                    <h3>{viewMyTasks ?
                        "You have completed all your tasks!" : "Great job! All tasks are completed!"}</h3>
                </div>
            ) : (
                <Table striped bordered className="mt-4 task-table">
                    <thead>
                        <tr>
                            <th>Entity Name {renderFilterIcon('entity_name')}</th>
                            <th>Task Type {renderFilterIcon('task_type')}</th>
                            <th>Time of Task {renderFilterIcon('time_of_task')}</th>
                            <th>Contact Person {renderFilterIcon('contact_person')}</th>
                            <th>Note {renderFilterIcon('note')}</th>
                            <th>Status {renderFilterIcon('status')}</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map(task => renderTaskRow(task))}
                    </tbody>
                </Table>
            )}
            {totalPages > 0 && (
                <Pagination className="mt-3 justify-content-center  fixed-pagination">
                    <PaginationItem disabled={currentPage <= 1}>
                        <PaginationLink
                            onClick={() => setCurrentPage(currentPage - 1)}
                            previous
                        />
                    </PaginationItem>
                    {[...Array(totalPages)].map((page, i) => (
                        <PaginationItem active={i + 1 === currentPage} key={i}>
                            <PaginationLink onClick={() => setCurrentPage(i + 1)}>
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem disabled={currentPage >= totalPages}>
                        <PaginationLink
                            onClick={() => setCurrentPage(currentPage + 1)}
                            next
                        />
                    </PaginationItem>
                </Pagination>
            )}
            {isModalOpen && (
                <AddNoteModal
                    isOpen={isModalOpen}
                    toggle={() => setIsModalOpen(!isModalOpen)}
                    taskId={selectedTaskId}
                    handleUpdateNote={handleUpdateNote}
                />
            )}
            {isEditModalOpen && editedTask && (
                <EditModal
                    isOpen={isEditModalOpen}
                    toggle={() => setIsEditModalOpen(!isEditModalOpen)}
                    task={editedTask}
                    onUpdate={handleUpdateTask}
                    currentUser={currentUser}
                />
            )}
            {isNoteModalOpen && (
                <Modal isOpen={isNoteModalOpen} toggle={() => setIsNoteModalOpen(!isNoteModalOpen)}>
                    <ModalBody>
                        <p>{noteContent}</p>
                    </ModalBody>
                </Modal>
            )}
            <ToastContainer />
        </Container>
    );
};

export default TaskList;
