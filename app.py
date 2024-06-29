from flask import Flask
from extensions import db, jwt, cors
from routes import auth_blueprint, task_blueprint


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = '5b976710f980986d2b8dbc3e7a0199b54f09a353a3bd0c8cb0420113f272c15a'
    app.config['JWT_SECRET_KEY'] = '60dfaae2b331b19f8075a4f6d05b6dc28db41291380f18dae1cb59ee77e25c8c'
    app.config[
        'SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://admin:password@todo.chu8iawia59w.ap-south-1.rds.amazonaws.com/todo'

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})

    app.register_blueprint(auth_blueprint, url_prefix='/auth')
    app.register_blueprint(task_blueprint, url_prefix='/tasks')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
