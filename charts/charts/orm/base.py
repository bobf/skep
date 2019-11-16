import sqlite3
import random

class Base:
    def __init__(self, db_path, logger):
        self.db_path = db_path
        self.logger = logger

    def connect(self):
        db = self.database()
        cursor = db.cursor()
        self.compact(cursor)

        return db, cursor

    def compact(self, cursor):
        if random.randrange(1, 1000) != 666:
            return

        for table in ('nodes', 'containers'):
            query = "DELETE FROM {table} WHERE tstamp < DATETIME('now', '-30 days')".format(table=table)
            self.logger.warn('Compacting database: {query}'.format(query=query))
            self.try_execute(cursor, query)

    def database(self):
        return sqlite3.connect(self.db_path)

    def save_db(self, cursor, table, row):
        columns, values = zip(*row.items())
        params = dict(
            table=table,
            columns=', '.join(columns),
            values=', '.join(['?'] * len(values))
        )
        sql = "INSERT INTO {table} ({columns}) VALUES ({values})".format(**params)

        return self.try_execute(cursor, sql, values)

    def try_execute(self, cursor, sql, values=(), attempts=0):
        try:
            return cursor.execute(sql, values)
        except sqlite3.OperationalError as e:
            if attempts == 5:
                raise

            return self.try_execute(cursor, sql, values, attempts + 1)

