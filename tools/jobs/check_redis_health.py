import time
import os 
import logging
from datetime import datetime
from typing import Optional 

def check_server_uptime(server:str) -> str:
    response = os.system("ping -c 1 " + server)
    if response == 0:
        return f"{server} is up!"
    else:
       return f"{server} is down!"

def write_uptime_log(log_path:Optional[str], value:str) -> None:

    #Write to local files
    if log_path is None:
        return
    if os.path.exists(log_path) is False:
        return
    file_folder= os.path.join(log_path, datetime.today().strftime('%Y-%m-%d'))
    if(os.path.exists(file_folder) is False):
        logging.debug("folder does not exist. creating folder")
        os.mkdir(file_folder)

    trace_file = os.path.join(file_folder, "redis_server_health.txt")

    try:
        if os.path.exists(trace_file) is False:
            with open(trace_file, 'w+') as f:
                f.write('Time,Response\n')
    except Exception as e:
        logging.debug(e)
        return
    
    try:
        with open(trace_file, 'a') as f:
            f.write(f"{datetime.today()},{value}\n")
    except Exception as e:
        logging.debug(e)
        return
        
def main() -> None:
    while True:
        g_response = check_server_uptime("google.com")
        redis_response = check_server_uptime("10.20.1.20")
        print(g_response)
        print(redis_response)
        write_uptime_log("C:/FRT/Logs/Redis/", g_response)
        write_uptime_log("C:/FRT/Logs/Redis/", redis_response)
        # Check every 10 seconds
        time.sleep(5)

if __name__ == "__main__":
    main()