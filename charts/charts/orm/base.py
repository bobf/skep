import psycopg2
from psycopg2 import sql
import random

class Base:
    def __init__(self, create_db_connection, logger):
        self.create_db_connection = create_db_connection
        self.db_connection = create_db_connection()
        self.logger = logger

    def execute(self, query, values=None):
        try:
            cursor = self.db_connection.cursor()
        except psycopg2.InterfaceError:
            self.db_connection = create_db_connection()
            cursor = self.db_connection.cursor()
        try:
            cursor.execute(query, values)
        except psycopg2.errors.InFailedSqlTransaction:
            cursor.rollback()
        else:
            self.db_connection.commit()
        finally:
            cursor.close()

    def save_db(self, table, row):
        columns, values = zip(*row.items())
        params = dict(
            table=table,
            columns=', '.join(columns),
            values=', '.join(['%s'] * len(values))
        )
        query = sql.SQL(
            "INSERT INTO {table} ({columns}) VALUES ({values})".format(**params)
        )

        return self.execute(query, values)
