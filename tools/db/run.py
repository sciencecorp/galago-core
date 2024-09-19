from uvicorn import run
import uvicorn
import logging 
from tools.app_config import Config 

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S', 
)

log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = "%(asctime)s | %(levelname)s | %(message)s"
log_config["formatters"]["default"]["fmt"] = "%(asctime)s | %(levelname)s | %(message)s"

if __name__ == "__main__":
    app_config = Config()
    app_config.load_app_config()
    host = "0.0.0.0"
    if app_config.app_config.host_ip:
        host = app_config.app_config.host_ip
    logging.info(f"Starting inventory api at {host}:8000")
    run("tools.db.api:app", host=host, port=8000, reload=False)
