import logging
import os
from datetime import datetime

def setup_logging():
    logs_dir = 'logs'
    if not os.path.exists(logs_dir):
        try:
            os.makedirs(logs_dir)
        except PermissionError:
            logs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'logs')
            os.makedirs(logs_dir, exist_ok=True)

    log_file = os.path.join(logs_dir, f"app_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")

    logger = logging.getLogger('SecureApportionment')
    logger.setLevel(logging.INFO)

    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger

logger = setup_logging()

logger.info("=" * 50)
logger.info("Secure Apportionment System Started")
logger.info("=" * 50)
