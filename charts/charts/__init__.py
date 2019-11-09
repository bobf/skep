import logging
import os
import sqlite3

logger = logging.getLogger('skep:charts')

def create_database(db_path):
    if 'SKEP_CHARTS_DB_PERSIST' not in os.environ:
        _delete_database(db_path)

    try:
        _create_database(db_path)
        logger.info('Database created: {path}'.format(path=db_path))
    except sqlite3.OperationalError:
        logger.info('Using existing database: {path}'.format(path=db_path))

def _delete_database(db_path):
    try:
        os.remove(db_path)
        logger.info('Previous database removed: {path}'.format(path=db_path))
    except FileNotFoundError:
        pass

def _create_database(db_path):
    database = sqlite3.connect(db_path)
    database.execute('''CREATE TABLE containers
        (tstamp real,
         id text,
         cpu real,
         system_cpu real,
         ram_usage real,
         ram_limit real,
         disk_ops real,
         network_bytes real)''')

    database.execute('''CREATE TABLE nodes
        (tstamp real,
         id text,
         load real,
         cpu real,
         ram real)''')

    database.execute('''CREATE INDEX containers_id_id_idx
        ON containers(id)''')

    database.execute('''CREATE INDEX nodes_id_idx
        ON nodes(id)''')
