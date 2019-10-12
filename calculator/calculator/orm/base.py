import sqlite3

class Base:
    def __init__(self, db_path):
        self.db_path = db_path

    def connect(self):
        db = self.database()
        cursor = db.cursor()

        return db, cursor

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
        return cursor.execute(sql, values)
