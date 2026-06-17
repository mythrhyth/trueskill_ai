"""
Clears all seeded/mock candidate data from the database.
Run once to start fresh with only real user data.
"""
import sqlite3

conn = sqlite3.connect('backend/services/persistence/trueskill.db')
cur = conn.cursor()

cur.execute('SELECT COUNT(*) FROM candidate_results')
before = cur.fetchone()[0]

cur.execute('DELETE FROM candidate_results')
conn.commit()

cur.execute('SELECT COUNT(*) FROM candidate_results')
after = cur.fetchone()[0]

print(f'Deleted {before - after} mock/seeded candidates.')
print(f'Remaining: {after}')
conn.close()
