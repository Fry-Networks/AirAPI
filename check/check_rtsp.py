import cv2
import schedule
import time
import logging
import os
from datetime import datetime, timezone
import sys
import subprocess
from dotenv import load_dotenv
from pymongo import MongoClient, errors

load_dotenv('../.env')

# Dynamically get the path to the script's directory
SCRIPT_PATH = os.path.dirname(os.path.abspath(__file__))
print(f"Script is running from: {SCRIPT_PATH}")

# ANSI color codes for terminal output
CYAN = '\033[96m'
RED = '\033[91m'
NC = '\033[0m'  # No color

# Path to the "RTSP Logs" folder
log_folder = os.path.join(SCRIPT_PATH, 'RTSP Logs')

# Create the folder if it doesn't exist
if not os.path.exists(log_folder):
    os.makedirs(log_folder)

def get_log_filename():
    current_time = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    return os.path.join(log_folder, f'rtsp_check_{current_time}.log')

log_filename = get_log_filename()
logging.basicConfig(filename=log_filename, level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

def load_rtsp_links(file_path=os.path.join(SCRIPT_PATH, 'rtsp_links.txt')):
    with open(file_path, 'r') as file:
        links = [line.strip() for line in file.readlines() if line.strip()]
    return links

def suppress_opencv_warnings():
    # Temporarily suppress OpenCV warnings by redirecting stderr to /dev/null
    sys.stderr = open(os.devnull, 'w')

def restore_opencv_warnings():
    # Restore stderr back to the default
    sys.stderr = sys.__stderr__

def connect_to_airdb():
    try:
        mongo_uri = os.getenv('MONGO_URI')
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        db = client['air']
        # Ping the server to check the connection
        client.admin.command('ping')
        print("Connected to air MongoDB!")
        return db

    except errors.ServerSelectionTimeoutError as err:
        print("Could not connect to air MongoDB:", err)
        return None

def connect_to_datadb():
    try:
        mongo_uri = os.getenv('MONGO_URI_DATA')
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        db = client['data-storage']
        # Ping the server to check the connection
        client.admin.command('ping')
        print("Connected to data-storage MongoDB!")
        return db

    except errors.ServerSelectionTimeoutError as err:
        print("Could not connect to data-storage MongoDB:", err)
        return None

air_db = connect_to_airdb()
data_db = connect_to_datadb()

def get_rtsp_links():
    try:
        if air_db is None:
            return None

        rtsp_collection = air_db['rtsplinks']
        docs = rtsp_collection.find()
        links = [doc.get("rtspUrl") for doc in docs if "rtspUrl" in doc]
        return links

    except errors.ServerSelectionTimeoutError as err:
        print("Could not fetch the rtsp links:", err)
        return None

def get_online_minerkey(url):
    try:
        if air_db is None:
            return None

        rtsp_collection = air_db['rtsplinks']
        docs = rtsp_collection.find()
        doc = [doc for doc in docs if doc.get("rtspUrl") == url]
        return doc

    except errors.ServerSelectionTimeoutError as err:
        print("Could not fetch the rtsp links:", err)
        return None

def save_status_to_db(doc):
    try:
        if data_db is None:
            return False
    
        if len(doc) == 0:
            return False

        miner_key = doc[0].get('minerKey')
        print(miner_key, len(doc))
        parts = miner_key.split('-', 1)
        collection = data_db[parts[0].lower() + '_datas']
        current_time = datetime.now(timezone.utc)
        collection.insert_one({
            'miner_key': miner_key,
            'status': 'online',
            'timestamp': current_time,
        })
        return True

    except errors.ServerSelectionTimeoutError as err:
        print("Could not connect to MongoDB:", err)
        return False

def check_rtsp_link(url, retries=3, timeout=10):
    """Attempts to check an RTSP link, retrying multiple times in case of failure."""
    success = False
    for attempt in range(retries):
        suppress_opencv_warnings()  # Suppress OpenCV warnings
        cap = cv2.VideoCapture(url)

        # Simulating a timeout check by waiting for the stream to open
        cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, timeout * 1000)

        if cap.isOpened():
            success = True
            doc = get_online_minerkey(url)
            result = save_status_to_db(doc)
            print(result)

            message = f"{url} - Online"
            logging.info(message)
            print(f"{CYAN}{message}{NC}")
            cap.release()
            break
        else:
            if attempt == retries - 1:
                # After the last attempt, mark as offline and print a red timeout message
                message = f"{url} - Offline after {retries} attempts"
                logging.warning(message)
                print(f"{RED}{message}{NC}")
            else:
                # Retry after a brief pause
                print(f"{RED}Attempt {attempt + 1} failed for {url}. Retrying...{NC}")
                time.sleep(2)  # Wait for 2 seconds before retrying
        
        restore_opencv_warnings()  # Restore warning output for next loop

    # Release the capture if it was opened at any point
    if cap and cap.isOpened():
        cap.release()

    return success

def check_rtsp_links():
    # rtsp_urls = load_rtsp_links()
    rtsp_urls = get_rtsp_links()
    for url in rtsp_urls:
        check_rtsp_link(url)

    global log_filename
    log_filename = get_log_filename()
    logging.basicConfig(filename=log_filename, level=logging.INFO,
                        format='%(asctime)s - %(levelname)s - %(message)s')

# Initial check when the script starts
check_rtsp_links()

schedule.every(60).minutes.do(check_rtsp_links)

while True:
    schedule.run_pending()
    time.sleep(1)