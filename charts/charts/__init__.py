import logging
import os
import psycopg2
from psycopg2.errors import DuplicateDatabase, DuplicateTable

logger = logging.getLogger('skep:charts')

def create_database(db_host):
    try:
        _create_database(db_host)
        logger.info("Database 'skep' created")
    except DuplicateDatabase:
        logger.info("Database 'skep' exists")

    try:
        _create_containers_table(db_host)
        logger.info("Table 'containers' created")
    except DuplicateTable:
        logger.info("Table 'containers' exists")

    try:
        _create_nodes_table(db_host)
        logger.info("Table 'nodes' created")
    except DuplicateTable:
        logger.info("Table 'nodes' exists")

def _create_database(db_host):
    connection = psycopg2.connect('postgresql://postgres:@%s/postgres' % db_host)
    connection.autocommit = True
    cursor = connection.cursor()
    cursor.execute("CREATE DATABASE skep")
    connection.commit()
    cursor.close()
    connection.close()


def _create_containers_table(db_host):
    connection = psycopg2.connect('postgresql://postgres:@%s/skep' % db_host)
    cursor = connection.cursor()
    cursor.execute('''CREATE TABLE containers
        (tstamp real,
         id varchar(255),
         cpu real,
         system_cpu real,
         ram_usage real,
         ram_limit real,
         disk_ops real,
         network_bytes real)''')
    cursor.execute('''CREATE INDEX ON containers (id, tstamp)''')
    connection.commit()
    cursor.close()
    connection.close()

def _create_nodes_table(db_host):
    connection = psycopg2.connect('postgresql://postgres:@%s/skep' % db_host)
    cursor = connection.cursor()
    cursor.execute('''CREATE TABLE nodes
        (tstamp real,
         id varchar(255),
         cpu real,
         load real,
         ram real)''')
    cursor.execute('''CREATE INDEX ON nodes (id, tstamp)''')
    connection.commit()
    cursor.close()
    connection.close()
