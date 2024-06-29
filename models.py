from extensions import db


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    entity_name = db.Column(db.String(128), nullable=False)
    task_type = db.Column(db.String(128), nullable=False)
    time_of_task = db.Column(db.DateTime, nullable=False)
    contact_person = db.Column(db.String(128), nullable=False)
    note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(10), default='open')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    tasks = db.relationship('Task', backref='user', lazy=True)

