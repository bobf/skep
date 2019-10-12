import os
import sqlite3

def create_database(db_path):
    return
    try:
        os.remove(db_path)
    except FileNotFoundError:
        pass

    database = sqlite3.connect(db_path)
    database.execute('''CREATE TABLE containers
        (tstamp real,
         container_id text,
         cpu real,
         system_cpu real,
         ram_usage real,
         ram_limit real,
         disk_ops real,
         network_bytes real)''')

    database.execute('''CREATE TABLE nodes
        (tstamp real,
         node_id text,
         cpu real,
         system_cpu real,
         ram real)''')
