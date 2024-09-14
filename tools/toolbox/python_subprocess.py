import subprocess 
from typing import Optional 
import os 
import logging 
from tools.conda_utils import get_conda_environments,check_conda_is_path


def run_python_script(python_file:str, as_module:bool = False, blocking:bool=True, env_variables:Optional[dict]=None, conda_environment: Optional[str]=None, use_shell:bool = False) -> None:
    if not os.path.exists(python_file):
        raise RuntimeError("Invalid file path")
    
    if env_variables:
        for key,value in env_variables:
            os.environ[key] = value 

    cmd = ["python",python_file]
    # if as_module:
    #     cmd.append("-m")
    
    #only switch environment on windows os. 
    if conda_environment and os.name == 'nt':
        conda_is_path = check_conda_is_path()
        if conda_is_path:
            envs = get_conda_environments()
            if conda_environment in envs:
                conda_cmd = f"conda activate {conda_environment}" + "&&" + " ".join(cmd)
                cmd =  ["cmd.exe", "/C", conda_cmd] 
            else:
                logging.warning(f"{conda_environment} not found, will attempt to run script with current env.")
        else:
            logging.warning("Conda is not in path. Running with default environment.")
    try:
        process = subprocess.Popen(cmd,shell=use_shell)
        if blocking:
            process.wait()
    except subprocess.CalledProcessError:
        logging.info(f"There was an error while running {python_file}")
    finally:
        process.kill()
        