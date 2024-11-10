import subprocess 
from typing import Optional 
import os 
import logging 
import typing as t

def run_python_script(python_file: str, blocking: bool = True) -> t.Optional[str]:
    if not os.path.exists(python_file):
        raise RuntimeError("Invalid file path")
    logging.info(f"Running {python_file}")
    cmd = ["python", python_file]
    try:
        process = subprocess.Popen(cmd)
        if blocking:
            process.wait()
    except FileNotFoundError:
        logging.error("Python executable not found.")
        raise
    except subprocess.CalledProcessError as e:
        logging.error(f"There was an error while running {python_file}: {e}")
        raise



if __name__ == "__main__":
    run_python_script("/Users/silvioo/Documents/galago-coreV2/tools/toolbox/scripts/variables_example.py",blocking=True,show_output=True)   