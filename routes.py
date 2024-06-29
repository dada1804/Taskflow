import logging
from flask import Blueprint, request, jsonify
from models import db, Task, User
from datetime import datetime
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from encrypt import encrypt_password

# Configure the logger to append logs to a file
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(user_id)s - %(email)s - %(message)s',
                    handlers=[
                        logging.FileHandler("app.log"),
                        logging.StreamHandler()
                    ])
logger = logging.getLogger(__name__)

task_blueprint = Blueprint('task_blueprint', __name__)
auth_blueprint = Blueprint('auth_blueprint', __name__)

def log_info(message, user_id=None, email=None):
    extra = {'user_id': user_id, 'email': email}
    if user_id is not None:
        logger.info(message, extra=extra)
    else:
        logger.info(message)


@auth_blueprint.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data['email']
    name = data['name']
    password = data['password']

    if User.query.filter_by(email=email).first():
        log_info("User already exists", email=email)
        return jsonify({"message": "User already exists"}), 409

    password = encrypt_password(password)
    new_user = User(email=email, name=name, password_hash=password)
    db.session.add(new_user)
    db.session.commit()

    log_info("User created", user_id=new_user.id, email=email)
    return jsonify({"message": "User created"}), 200

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()
    if not user or not user.password_hash == encrypt_password(password):
        log_info("Invalid email or password", email=email)
        return jsonify({"message": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.id)
    log_info("User logged in", user_id=user.id, email=email)
    return jsonify(access_token=access_token, id=user.id, name=user.name), 200

@task_blueprint.route('/create-task', methods=['POST'])
@jwt_required()
def create_task():
    data = request.json
    user_id = get_jwt_identity()
    if user_id == data['contact_person_id']:
        log_info("User attempted to assign task to self", user_id=user_id)
        return jsonify({"message":"You cannot assign a task to yourself"}), 199
    time_of_task = datetime.fromisoformat(data['time_of_task'])
    new_task = Task(
        entity_name=data['entity_name'],
        task_type=data['task_type'],
        time_of_task=time_of_task,
        contact_person=data['contact_person'],
        note=data.get('note'),
        status=data.get('status', 'open'),
        user_id=data['contact_person_id']
    )
    db.session.add(new_task)
    db.session.commit()
    log_info("Task created", user_id=user_id, email=data['contact_person'])
    return jsonify({"message": "Task created"}), 200

@task_blueprint.route('/duplicate-task', methods=['POST'])
@jwt_required()
def duplicate_task():
    data = request.json
    user_id = get_jwt_identity()
    time_of_task = datetime.strptime(data['time_of_task'], '%Y-%m-%dT%H:%M:%S.%fZ')
    new_task = Task(
        entity_name=data['entity_name'],
        task_type=data['task_type'],
        time_of_task=time_of_task,
        contact_person=data['contact_person'],
        note=data['note'],
        status='open',
        user_id=data['user_id']
    )
    db.session.add(new_task)
    db.session.commit()
    log_info("Task duplicated successfully", user_id=user_id, email=data['contact_person'])
    return jsonify({"message": "Task duplicated successfully!"}), 200

@task_blueprint.route('/all-tasks', methods=['GET'])
@jwt_required()
def get_all_tasks():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    tasks = Task.query.paginate(page=page, per_page=per_page, error_out=False)
    tasks_list = [{
        'id': task.id,
        'date_created': task.date_created,
        'entity_name': task.entity_name,
        'task_type': task.task_type,
        'time_of_task': task.time_of_task,
        'contact_person': task.contact_person,
        'note': task.note,
        'status': task.status,
        'user_id': task.user_id
    } for task in tasks.items if task.user_id != user_id]
    log_info("Retrieved all tasks", user_id=user_id)
    return jsonify({
        'tasks': tasks_list,
        'total': tasks.total,
        'pages': tasks.pages,
        'current_page': tasks.page
    })

@task_blueprint.route('/my-tasks', methods=['GET'])
@jwt_required()
def get_my_tasks():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    tasks = Task.query.filter_by(contact_person=user.name).paginate(page=page, per_page=per_page, error_out=False)
    tasks_list = [{
        'id': task.id,
        'date_created': task.date_created,
        'entity_name': task.entity_name,
        'task_type': task.task_type,
        'time_of_task': task.time_of_task,
        'contact_person': task.contact_person,
        'note': task.note,
        'status': task.status
    } for task in tasks.items]
    log_info("Retrieved user's tasks", user_id=user_id, email=user.email)
    return jsonify({
        'tasks': tasks_list,
        'total': tasks.total,
        'pages': tasks.pages,
        'current_page': tasks.page
    })

@task_blueprint.route('/update/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    task = Task.query.get(task_id)
    user_id = get_jwt_identity()
    if not task:
        log_info("Task not found", user_id=user_id)
        return jsonify({"message": "Task not found"}), 404
    data = request.json
    if 'contact_person_id' in data and user_id == data['contact_person_id']:
        log_info("User attempted to reassign task to self", user_id=user_id)
        return jsonify({"message":"You cannot assign task to yourself"}), 199
    task.entity_name = data.get('entity_name', task.entity_name)
    task.task_type = data.get('task_type', task.task_type)
    task.time_of_task = data.get('time_of_task', task.time_of_task)
    task.contact_person = data.get('contact_person', task.contact_person)
    task.note = data.get('note', task.note)
    task.status = data.get('status', task.status)
    db.session.commit()
    log_info("Task updated", user_id=user_id, email=task.contact_person)
    return jsonify({"message": "Task updated"}), 200

@task_blueprint.route('/delete/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    task = Task.query.get(task_id)
    user_id = get_jwt_identity()
    if not task:
        log_info("Task not found", user_id=user_id)
        return jsonify({"message": "Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    log_info("Task deleted", user_id=user_id, email=task.contact_person)
    return jsonify({"message": "Task deleted"}), 200

@task_blueprint.route('/contact-persons', methods=['GET'])
@jwt_required()
def get_contact_persons():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    # Get other users
    users = User.query.filter(User.email != current_user.email).all()
    user_list = [{'id': user.id, 'name': user.name} for user in users]
    
    # Logging with current user's ID and email
    log_info("Retrieved contact persons", user_id=current_user_id, email=current_user.email)
    
    return jsonify(user_list)

