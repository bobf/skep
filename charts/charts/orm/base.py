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
        if random.randrange(1, 100000) != 666:
            return

        for table in ('nodes', 'containers'):
            sql = "DELETE FROM {table} WHERE tstamp < DATETIME('now', '-30 days')".format(table=table)
            self.logger.warn('Compacting database: {query}'.format(query=query))
            self.execute(cursor, query)

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

        return self.execute(cursor, sql, values)
