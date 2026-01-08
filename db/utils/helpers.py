from typing import Dict, Any
import json
import tempfile
import os


def create_temp_json_file(data: Dict[str, Any], filename: str) -> str:
    """Create a temporary JSON file and return the path."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as temp_file:
        temp_file_path = temp_file.name
        temp_file.write(json.dumps(data, indent=2).encode("utf-8"))
    return temp_file_path


def sanitize_filename(filename: str) -> str:
    """Sanitize a filename by replacing spaces and special characters."""
    return filename.replace(" ", "_").replace("/", "_").replace("\\", "_")


def cleanup_temp_file(file_path: str) -> None:
    """Clean up a temporary file."""
    try:
        os.unlink(file_path)
    except OSError:
        pass  # File already deleted or doesn't exist
