import datetime
import json
import shutil
import sqlite3
from pathlib import Path

pgadmin_db = Path(r"C:\Users\Asif Khan\AppData\Roaming\pgAdmin\pgadmin4.db")
backup = pgadmin_db.with_name(
    "pgadmin4.db.backup-render-ofos-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
)
shutil.copy2(pgadmin_db, backup)

host = "dpg-d84qf6btqb8s73fitil0-a.oregon-postgres.render.com"
database = "ofos_postgres"
username = "ofos_postgres_user"
password = "qKKcyPTiQNszsKjbzEZzEomH4NHJXVQn"
server_name = "Render OFOS PostgreSQL"

pgpass_dir = Path(r"C:\Users\Asif Khan\AppData\Roaming\postgresql")
pgpass_dir.mkdir(parents=True, exist_ok=True)
pgpass = pgpass_dir / "pgpass.conf"
line = f"{host}:5432:{database}:{username}:{password}"
existing = pgpass.read_text(encoding="utf-8").splitlines() if pgpass.exists() else []
filtered = [
    item for item in existing
    if not item.startswith(f"{host}:5432:{database}:{username}:")
]
filtered.append(line)
pgpass.write_text("\n".join(filtered) + "\n", encoding="utf-8")

con = sqlite3.connect(pgadmin_db)
cur = con.cursor()
user_id = cur.execute("select id from user order by id limit 1").fetchone()[0]
servergroup = cur.execute(
    "select id from servergroup where user_id=? and name='Servers'",
    (user_id,),
).fetchone()
if servergroup:
    servergroup_id = servergroup[0]
else:
    servergroup_id = 1
    cur.execute(
        "insert or ignore into servergroup(id, user_id, name) values (?, ?, 'Servers')",
        (servergroup_id, user_id),
    )

cur.execute(
    "delete from server where user_id=? and name=?",
    (user_id, server_name),
)
cur.execute(
    """
    insert into server (
      user_id, servergroup_id, name, host, port, maintenance_db, username,
      comment, save_password, shared, kerberos_conn, cloud_status,
      connection_params, db_res_type, use_ssh_tunnel, tunnel_authentication,
      tunnel_keep_alive, is_adhoc
    )
    values (?, ?, ?, ?, 5432, ?, ?, ?, 0, 0, 0, 0, ?, 'databases', 0, 0, 0, 0)
    """,
    (
        user_id,
        servergroup_id,
        server_name,
        host,
        database,
        username,
        "Render PostgreSQL database for OFOS production app",
        json.dumps({"sslmode": "require", "connect_timeout": 10}),
    ),
)
con.commit()
con.close()

print(f"Added pgAdmin server: {server_name}")
print(f"Backup created: {backup}")
print(f"pgpass configured: {pgpass}")
