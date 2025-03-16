from flask.cli import FlaskGroup
from backend.app import app

cli = FlaskGroup(app)

if __name__ == "__main__":
    cli()
