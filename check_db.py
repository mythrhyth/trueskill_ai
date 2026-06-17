import sqlite3, json

conn = sqlite3.connect('backend/services/persistence/trueskill.db')
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('Tables:', cur.fetchall())

cur.execute('SELECT COUNT(*) FROM candidate_results')
print('Total candidates:', cur.fetchone()[0])

cur.execute('SELECT candidate_id, name, email, score FROM candidate_results LIMIT 5')
rows = cur.fetchall()
print('\nSample candidates:')
for r in rows:
    print(' -', r)

conn.close()
