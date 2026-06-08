const http = require('http');
const { execFile } = require('child_process');

const PORT = Number(process.env.PORT || 5050);
const DB = {
  host: 'dpg-d84qf6btqb8s73fitil0-a.oregon-postgres.render.com',
  database: 'ofos_postgres',
  user: 'ofos_postgres_user',
  password: process.env.RENDER_DB_PASSWORD,
};

if (!DB.password) {
  console.error('Set RENDER_DB_PASSWORD before starting this viewer.');
  process.exit(1);
}

const connection = `sslmode=require host=${DB.host} dbname=${DB.database} user=${DB.user}`;

function runSql(sql) {
  return new Promise((resolve, reject) => {
    execFile(
      'psql',
      [connection, '-t', '-A', '-q', '-c', sql],
      { env: { ...process.env, PGPASSWORD: DB.password }, maxBuffer: 1024 * 1024 * 20 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        resolve(stdout.trim());
      }
    );
  });
}

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function page(res) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OFOS Render DB Viewer</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, Segoe UI, Arial, sans-serif; background: #f6f7fb; color: #111827; }
    header { height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; background: #111827; color: white; }
    header strong { font-size: 16px; }
    main { height: calc(100vh - 56px); display: grid; grid-template-columns: 280px 1fr; }
    aside { border-right: 1px solid #e5e7eb; background: white; overflow: auto; }
    .search { padding: 12px; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; background: white; }
    input, select { width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 9px 10px; font: inherit; }
    .table-link { width: 100%; border: 0; background: transparent; padding: 10px 14px; text-align: left; cursor: pointer; border-bottom: 1px solid #f3f4f6; }
    .table-link:hover, .table-link.active { background: #fff7ed; color: #ea580c; }
    .content { min-width: 0; overflow: hidden; display: flex; flex-direction: column; }
    .toolbar { padding: 14px 18px; background: white; border-bottom: 1px solid #e5e7eb; display: flex; gap: 12px; align-items: center; justify-content: space-between; }
    .toolbar h1 { margin: 0; font-size: 18px; }
    .toolbar .actions { display: flex; gap: 10px; align-items: center; }
    button.primary { border: 0; border-radius: 8px; padding: 9px 12px; background: #f97316; color: white; cursor: pointer; font-weight: 700; }
    .meta { color: #6b7280; font-size: 13px; }
    .table-wrap { overflow: auto; height: 100%; padding: 0; }
    table { border-collapse: collapse; width: max-content; min-width: 100%; background: white; }
    th, td { border-bottom: 1px solid #e5e7eb; border-right: 1px solid #f3f4f6; padding: 8px 10px; font-size: 13px; max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    th { position: sticky; top: 0; background: #f9fafb; z-index: 1; text-align: left; font-weight: 800; }
    .empty, .error { margin: 18px; padding: 14px; border-radius: 10px; background: white; border: 1px solid #e5e7eb; }
    .error { border-color: #fecaca; background: #fff1f2; color: #991b1b; }
    @media (max-width: 800px) { main { grid-template-columns: 1fr; } aside { height: 220px; } }
  </style>
</head>
<body>
  <header>
    <strong>OFOS Render Database Viewer</strong>
    <span class="meta">Read-only table browser</span>
  </header>
  <main>
    <aside>
      <div class="search"><input id="filter" placeholder="Search tables..." /></div>
      <div id="tables"></div>
    </aside>
    <section class="content">
      <div class="toolbar">
        <div>
          <h1 id="title">Select a table</h1>
          <div id="meta" class="meta">Render PostgreSQL: ofos_postgres</div>
        </div>
        <div class="actions">
          <select id="limit">
            <option value="25">25 rows</option>
            <option value="50" selected>50 rows</option>
            <option value="100">100 rows</option>
            <option value="250">250 rows</option>
          </select>
          <button class="primary" id="refresh">Refresh</button>
        </div>
      </div>
      <div id="data" class="table-wrap"><div class="empty">Choose any table from the left side.</div></div>
    </section>
  </main>
  <script>
    let allTables = [];
    let active = null;

    async function api(path) {
      const res = await fetch(path);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Request failed');
      return body;
    }

    function renderTables() {
      const q = document.getElementById('filter').value.toLowerCase();
      document.getElementById('tables').innerHTML = allTables
        .filter(t => t.table_name.toLowerCase().includes(q))
        .map(t => '<button class="table-link ' + (active === t.table_name ? 'active' : '') + '" data-name="' + t.table_name + '">' + t.table_name + '<div class="meta">' + t.table_schema + '</div></button>')
        .join('');
    }

    async function loadTables() {
      allTables = await api('/api/tables');
      renderTables();
    }

    function renderRows(columns, rows) {
      if (!rows.length) return '<div class="empty">No rows found in this table.</div>';
      return '<table><thead><tr>' + columns.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' +
        rows.map(row => '<tr>' + columns.map(c => '<td title="' + String(row[c] ?? '').replaceAll('"', '&quot;') + '">' + String(row[c] ?? '') + '</td>').join('') + '</tr>').join('') +
        '</tbody></table>';
    }

    async function loadData(name) {
      active = name;
      renderTables();
      document.getElementById('title').textContent = name;
      document.getElementById('data').innerHTML = '<div class="empty">Loading rows...</div>';
      try {
        const limit = document.getElementById('limit').value;
        const payload = await api('/api/table?name=' + encodeURIComponent(name) + '&limit=' + limit);
        document.getElementById('meta').textContent = payload.row_count + ' rows total, showing ' + payload.rows.length;
        document.getElementById('data').innerHTML = renderRows(payload.columns, payload.rows);
      } catch (e) {
        document.getElementById('data').innerHTML = '<div class="error">' + e.message + '</div>';
      }
    }

    document.getElementById('tables').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-name]');
      if (btn) loadData(btn.dataset.name);
    });
    document.getElementById('filter').addEventListener('input', renderTables);
    document.getElementById('limit').addEventListener('change', () => active && loadData(active));
    document.getElementById('refresh').addEventListener('click', () => active ? loadData(active) : loadTables());
    loadTables().catch(e => document.getElementById('data').innerHTML = '<div class="error">' + e.message + '</div>');
  </script>
</body>
</html>`);
}

function quoteIdent(name) {
  return '"' + String(name).replace(/"/g, '""') + '"';
}

async function tables() {
  const sql = `
    select coalesce(json_agg(row_to_json(t)), '[]'::json)
    from (
      select table_schema, table_name
      from information_schema.tables
      where table_schema not in ('pg_catalog','information_schema')
      order by table_schema, table_name
    ) t;
  `;
  return JSON.parse(await runSql(sql));
}

async function tableRows(name, limit) {
  const allowed = await tables();
  const table = allowed.find((t) => t.table_name === name);
  if (!table) {
    const error = new Error('Table not found');
    error.status = 404;
    throw error;
  }
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 250);
  const fullName = `${quoteIdent(table.table_schema)}.${quoteIdent(table.table_name)}`;
  const columnSql = `
    select coalesce(json_agg(column_name order by ordinal_position), '[]'::json)
    from information_schema.columns
    where table_schema = '${table.table_schema.replace(/'/g, "''")}'
      and table_name = '${table.table_name.replace(/'/g, "''")}';
  `;
  const rowSql = `select coalesce(json_agg(row_to_json(x)), '[]'::json) from (select * from ${fullName} limit ${safeLimit}) x;`;
  const countSql = `select count(*) from ${fullName};`;
  const [columns, rows, rowCount] = await Promise.all([
    runSql(columnSql).then(JSON.parse),
    runSql(rowSql).then(JSON.parse),
    runSql(countSql).then((value) => Number(value || 0)),
  ]);
  return { columns, rows, row_count: rowCount };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/') return page(res);
    if (url.pathname === '/api/tables') return json(res, 200, await tables());
    if (url.pathname === '/api/table') {
      return json(res, 200, await tableRows(url.searchParams.get('name'), url.searchParams.get('limit')));
    }
    json(res, 404, { error: 'Not found' });
  } catch (error) {
    json(res, error.status || 500, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Render DB viewer running at http://localhost:${PORT}`);
});
