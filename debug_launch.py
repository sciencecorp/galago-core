import logging
import sys
from tools.launch_tools import main

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

if __name__ == "__main__":
    try:
        main()
    except Exception:
        logging.exception("Failed to launch tools")
        sys.exit(1)