import sqlite3

path = r"C:\Users\Asif Khan\AppData\Roaming\pgAdmin\pgadmin4.db"
con = sqlite3.connect(path)
cur = con.cursor()
for name, sql in cur.execute(
    "select name, sql from sqlite_master where type='table' and name in ('server','servergroup','user') order by name"
):
    print("---", name)
    print(sql)
print("--- users")
for row in cur.execute("select id, email, username, auth_source from user"):
    print(row)
print("--- servergroups")
for row in cur.execute("select id, user_id, name from servergroup"):
    print(row)
print("--- servers")
for row in cur.execute("select id, user_id, servergroup_id, name, host, port, maintenance_db, username, save_password, connection_params, db_res, db_res_type from server"):
    print(row)
con.close()
