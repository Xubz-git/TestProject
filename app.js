// 主应用脚本
let data = [];
let settings = {};
let currentHash = '';

window.addEventListener('DOMContentLoaded', () => {
  data = loadData();
  settings = loadSettings();
  window.addEventListener('hashchange', router);
  document.addEventListener('keydown', keyHandler);
  router();
});

// 路由解析
function router(){
  const hash = location.hash || '#/home';
  if(hash === currentHash) return;
  currentHash = hash;
  const [path, qs] = hash.slice(2).split('?');
  const params = new URLSearchParams(qs || '');
  const view = document.getElementById('view');
  view.classList.remove('show');
  setTimeout(()=>{ render(path, params, view); view.classList.add('show'); },50);
}

function render(page, params, view){
  switch(page){
    case 'home': renderHome(view); break;
    case 'catalog': renderCatalog(view, params); break;
    case 'detail': renderDetail(view, params); break;
    case 'departments': renderDepartments(view); break;
    case 'stats': renderStats(view); break;
    case 'settings': renderSettings(view); break;
    default: view.innerHTML = '<p>未找到页面</p>';
  }
}

// 首页
function renderHome(view){
  const total = data.length;
  const active = data.filter(d=>d.status==='有效').length;
  const updated = [...data].sort((a,b)=>new Date(b.updated)-new Date(a.updated)).slice(0,5);
  view.innerHTML = `
    <section>
      <h1>${settings.province}生态环境厅数据资源目录</h1>
      <div class="cards">
        <div class="card">总目录：${total}</div>
        <div class="card">有效：${active}</div>
      </div>
      <h2>近期更新时间</h2>
      <ul>${updated.map(u=>`<li>${u.updated} - ${u.name}</li>`).join('')}</ul>
      <h2>类型占比</h2>
      <canvas id="pie" width="300" height="150" aria-label="类型占比图" role="img"></canvas>
    </section>`;
  const types = ['开放','共享','内部'];
  drawPieChart(document.getElementById('pie'), types, types.map(t=>data.filter(d=>d.type===t).length));
}

// 目录管理
function renderCatalog(view, params){
  const search = params.get('search') || '';
  const dept = params.get('dept') || '';
  const page = parseInt(params.get('page')||'1');
  const sort = params.get('sort') || 'id';
  const order = params.get('order') || 'asc';
  let list = data.filter(d=>d.name.includes(search) && (!dept||d.department===dept));
  list.sort((a,b)=>{
    if(sort==='updated') return order==='asc'? new Date(a.updated)-new Date(b.updated): new Date(b.updated)-new Date(a.updated);
    return order==='asc'? a[sort]>b[sort]?1:-1 : b[sort]>a[sort]?1:-1;
  });
  const pageSize = settings.pageSize;
  const pages = Math.ceil(list.length/pageSize);
  const show = list.slice((page-1)*pageSize, page*pageSize);
  view.innerHTML = `
  <section>
    <div class="toolbar">
      <input id="search" placeholder="搜索" value="${search}" aria-label="搜索" />
      <select id="deptFilter"><option value="">全部部门</option>${[...new Set(data.map(d=>d.department))].map(d=>`<option ${d===dept?'selected':''}>${d}</option>`).join('')}</select>
      <button id="addBtn">新增</button>
      <button id="exportBtn">导出</button>
      <input type="file" id="importFile" class="hidden" />
      <button id="importBtn">导入</button>
      <button id="enableBtn">启用</button>
      <button id="disableBtn">停用</button>
      <button id="deleteBtn">删除</button>
    </div>
    <table>
      <thead><tr>
        <th><input type="checkbox" id="checkAll"></th>
        <th data-sort="name">名称</th>
        <th>部门</th>
        <th>类型</th>
        <th>状态</th>
        <th data-sort="updated">更新时间</th>
        <th>操作</th>
      </tr></thead>
      <tbody>
        ${show.map(d=>`<tr data-id="${d.id}">
          <td><input type="checkbox" class="rowCheck"></td>
          <td>${d.name}</td>
          <td>${d.department}</td>
          <td>${d.type}</td>
          <td>${d.status}</td>
          <td>${d.updated}</td>
          <td><button class="editBtn">编辑</button><button class="detailBtn">详情</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="pager">第 ${page}/${pages} 页 <button id="prev">上一页</button><button id="next">下一页</button></div>
  </section>`;

  // 事件绑定
  document.getElementById('search').addEventListener('input', e=>updateHash({search:e.target.value,page:1}));
  document.getElementById('deptFilter').addEventListener('change', e=>updateHash({dept:e.target.value,page:1}));
  document.querySelectorAll('th[data-sort]').forEach(th=>th.addEventListener('click',()=>{
    const s = th.getAttribute('data-sort');
    const newOrder = (s===sort && order==='asc')?'desc':'asc';
    updateHash({sort:s,order:newOrder});
  }));
  document.getElementById('prev').onclick=()=>{ if(page>1) updateHash({page:page-1}); };
  document.getElementById('next').onclick=()=>{ if(page<pages) updateHash({page:page+1}); };
  document.getElementById('addBtn').onclick=()=>openForm();
  document.querySelectorAll('.editBtn').forEach(btn=>btn.onclick=()=>openForm(btn.closest('tr').dataset.id));
  document.querySelectorAll('.detailBtn').forEach(btn=>btn.onclick=()=>location.hash=`#/detail?id=${btn.closest('tr').dataset.id}`);
  document.getElementById('importBtn').onclick=()=>document.getElementById('importFile').click();
  document.getElementById('importFile').onchange=importJSON;
  document.getElementById('exportBtn').onclick=exportJSON;
  // 批量操作
  document.getElementById('checkAll').onchange=e=>{document.querySelectorAll('.rowCheck').forEach(c=>c.checked=e.target.checked);};
  document.getElementById('enableBtn').onclick=()=>bulkUpdate('有效');
  document.getElementById('disableBtn').onclick=()=>bulkUpdate('停用');
  document.getElementById('deleteBtn').onclick=()=>bulkDelete();
}

function bulkUpdate(status){
  document.querySelectorAll('.rowCheck:checked').forEach(c=>{
    const id = +c.closest('tr').dataset.id;
    const item = data.find(d=>d.id===id);
    item.status = status;
    item.updated = new Date().toISOString().split('T')[0];
  });
  saveData(data); router();
}
function bulkDelete(){
  const ids = Array.from(document.querySelectorAll('.rowCheck:checked')).map(c=>+c.closest('tr').dataset.id);
  if(!ids.length) return;
  data = data.filter(d=>!ids.includes(d.id));
  saveData(data); router();
}

// 新增/编辑表单
function openForm(id){
  const item = data.find(d=>d.id==id) || {name:'',department:'',type:'开放',status:'有效',tags:''};
  const modal = document.getElementById('modal');
  modal.innerHTML = `
  <div class="modal-content"><h2 id="modal-title">${id?'编辑':'新增'}</h2>
    <form id="form">
      <label>名称<input name="name" value="${item.name}" required></label>
      <label>部门<input name="department" value="${item.department}" required></label>
      <label>类型<select name="type"><option>开放</option><option>共享</option><option>内部</option></select></label>
      <label>状态<select name="status"><option>有效</option><option>停用</option></select></label>
      <label>标签<input name="tags" value="${item.tags||''}" placeholder="逗号分隔"></label>
      <button type="submit">保存</button>
      <button type="button" id="cancel">取消</button>
    </form></div>`;
  modal.classList.remove('hidden');
  modal.classList.add('show');
  const form = document.getElementById('form');
  form.type.value = item.type; form.status.value = item.status;
  document.getElementById('cancel').onclick=closeModal;
  form.onsubmit=e=>{
    e.preventDefault();
    if(id){
      item.name=form.name.value;item.department=form.department.value;item.type=form.type.value;item.status=form.status.value;item.tags=form.tags.value.split(',');
      item.updated=new Date().toISOString().split('T')[0];
    }else{
      data.push({id:Date.now(),name:form.name.value,department:form.department.value,type:form.type.value,status:form.status.value,tags:form.tags.value.split(','),updated:new Date().toISOString().split('T')[0],history:[]});
    }
    saveData(data); closeModal(); router();
  };
}
function closeModal(){ const modal=document.getElementById('modal'); modal.classList.add('hidden'); modal.classList.remove('show'); modal.innerHTML=''; }

// 导入导出
function exportJSON(){
  const blob = new Blob([JSON.stringify(data)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'catalog.json';
  a.click();
}
function importJSON(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => { data = JSON.parse(ev.target.result); saveData(data); router(); };
  reader.readAsText(file);
}

// 目录详情
function renderDetail(view, params){
  const id = +params.get('id');
  const item = data.find(d=>d.id===id);
  if(!item){ view.innerHTML='<p>未找到数据</p>'; return; }
  view.innerHTML = `<section>
    <h1>${item.name}</h1>
    <p>部门：${item.department}</p>
    <p>类型：${item.type}</p>
    <p>状态：${item.status}</p>
    <p>更新时间：${item.updated}</p>
    <p>标签：${item.tags.join(',')}</p>
    <button onclick="location.hash='#/catalog'">返回</button>
  </section>`;
}

// 部门与标签
function renderDepartments(view){
  const depts = {};
  const tags = {};
  data.forEach(d=>{
    depts[d.department]=(depts[d.department]||0)+1;
    d.tags.forEach(t=>{ tags[t]=(tags[t]||0)+1; });
  });
  view.innerHTML=`<section>
    <h1>部门列表</h1>
    <ul>${Object.entries(depts).map(([k,v])=>`<li><a href="#/catalog?dept=${k}">${k} (${v})</a></li>`).join('')}</ul>
    <h1>标签云</h1>
    <div class="tags">${Object.entries(tags).map(([k,v])=>`<a href="#/catalog?search=${k}" style="font-size:${12+v*2}px">${k}</a>`).join(' ')}</div>
  </section>`;
}

// 统计分析
function renderStats(view){
  const deptCount = Object.values(data.reduce((m,d)=>{m[d.department]=(m[d.department]||0)+1;return m;},{}));
  const deptLabels = Object.keys(data.reduce((m,d)=>{m[d.department]=(m[d.department]||0)+1;return m;},{}));
  const statusLabels = ['有效','停用'];
  const statusData = statusLabels.map(s=>data.filter(d=>d.status===s).length);
  const lineLabels = data.map(d=>d.updated).slice(0,10);
  const lineData = data.slice(0,10).map((_,i)=>i+1);
  view.innerHTML=`<section>
    <h1>统计分析</h1>
    <canvas id="bar" width="300" height="150"></canvas>
    <canvas id="ring" width="300" height="150"></canvas>
    <canvas id="line" width="300" height="150"></canvas>
    <button id="exportChart">导出 PNG</button>
  </section>`;
  drawBarChart(document.getElementById('bar'), deptLabels, deptCount);
  drawPieChart(document.getElementById('ring'), statusLabels, statusData);
  drawLineChart(document.getElementById('line'), lineLabels, lineData);
  document.getElementById('exportChart').onclick=()=>exportPNG(document.getElementById('bar'),'charts.png');
}

// 系统设置
function renderSettings(view){
  view.innerHTML=`<section>
    <h1>系统设置</h1>
    <form id="settingForm">
      <label>省名<input name="province" value="${settings.province}"></label>
      <label>主题<select name="theme"><option value="light">浅色</option><option value="dark">深色</option></select></label>
      <label>每页条数<input name="pageSize" type="number" value="${settings.pageSize}" min="1"></label>
      <button type="submit">保存</button>
    </form>
    <button id="clearData">清空数据</button>
    <button id="loadSample">加载示例数据</button>
    <p>关于：本系统为示例原型。</p>
  </section>`;
  const form=document.getElementById('settingForm');
  form.theme.value=settings.theme;
  form.onsubmit=e=>{e.preventDefault();settings.province=form.province.value;settings.theme=form.theme.value;settings.pageSize=parseInt(form.pageSize.value);document.body.setAttribute('data-theme',settings.theme);saveSettings(settings);router();};
  document.getElementById('clearData').onclick=()=>{if(confirm('确认清空?')){localStorage.clear();data=generateSampleData();saveData(data);settings=loadSettings();router();}};
  document.getElementById('loadSample').onclick=()=>{data=generateSampleData();saveData(data);router();};
}

// 键盘快捷键
function keyHandler(e){
  if(e.key==='/'){ e.preventDefault(); const s=document.getElementById('search'); if(s) s.focus(); }
  if(e.key==='Escape'){ closeModal(); }
  if(e.key==='Enter'){ const m=document.getElementById('modal'); if(!m.classList.contains('hidden')){ const form=m.querySelector('form'); if(form) form.requestSubmit(); }}
}

function updateHash(obj){
  const [path, qs] = location.hash.slice(2).split('?');
  const params = new URLSearchParams(qs||'');
  Object.entries(obj).forEach(([k,v])=>{ params.set(k,v); });
  location.hash = `#/${path}?${params.toString()}`;
}
