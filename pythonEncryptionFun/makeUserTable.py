import sqlite3
import json
import bcrypt

conn = sqlite3.connect("Users.db")
cursor = conn.cursor()
cursor.execute("""
    create table if not exists Users
        (uuid integer primary key,
        pwd BINARY(60),
        schedule text)
""")