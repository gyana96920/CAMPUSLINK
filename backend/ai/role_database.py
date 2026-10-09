import json
from pathlib import Path


ROLE_DATA_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "roles.json"
)


def load_roles():
    with open(ROLE_DATA_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


ROLE_DATABASE = load_roles()
