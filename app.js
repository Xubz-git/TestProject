// 主交互逻辑
import {initData, getMetrics, getRecentUpdates, getDeptCounts, getMonthlyTrend, getDirectories} from './data.js';
import {drawBarChart, drawLineChart, drawPieChart, exportPNG} from './charts.js';

initData();

const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

function showPage(id){
  pages.forEach(p=>p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  navLinks.forEach(l=>l.classList.toggle('active', l.dataset.page===id));
}

window.addEventListener('hashchange',()=>{
  const page = location.hash.replace('#','') || 'home';
  showPage(page);
  if(page==='home') renderHome();
  if(page==='directory') renderTable();
  if(page==='stats') renderStats();
});

// 初始展示
const startPage = location.hash.replace('#','') || 'home';
showPage(startPage);
if(startPage==='home') renderHome();
if(startPage==='directory') renderTable();
if(startPage==='stats') renderStats();

// 主题切换
const themeToggle=document.getElementById('themeToggle');
let theme = localStorage.getItem('theme') || 'light';
setTheme(theme);

themeToggle.addEventListener('click',()=>{
  theme = theme==='dark'?'light':'dark';
  setTheme(theme);
});

function setTheme(th){
  document.documentElement.setAttribute('data-theme',th);
  localStorage.setItem('theme',th);
  themeToggle.textContent= th==='dark'? '☀️':'🌙';
  renderCharts(); // 主题改变时重绘图表
}

// 首页渲染
function renderHome(){
  renderMetrics();
  renderTimeline();
  renderDeptBar();
  renderUpdateLine();
}

function renderMetrics(){
  const box = document.getElementById('metrics');
  box.innerHTML='';
  const m = getMetrics();
  const data=[
    {label:'总目录',value:m.total,icon:'📚',bg:'#1E88E5'},
    {label:'开放目录',value:m.open,icon:'🔓',bg:'#42A5F5'},
    {label:'部门数',value:m.departments,icon:'🏢',bg:'#1976D2'},
    {label:'本月新增',value:m.monthAdd,icon:'📈',bg:'#64B5F6'}
  ];
  data.forEach(d=>{
    const card=document.createElement('div');
    card.className='metric-card';
    card.style.background=d.bg;
    card.innerHTML=`<div><div>${d.label}</div><div style="font-size:1.5rem">${d.value}</div></div><i>${d.icon}</i>`;
    box.appendChild(card);
  });
}

function renderTimeline(){
  const list = document.getElementById('timeline');
  list.innerHTML='<h3>近期更新时间</h3>';
  getRecentUpdates().forEach(item=>{
    const div=document.createElement('div');
    div.className='timeline-item';
    div.innerHTML=`<time>${item.date}</time> <span>${item.name}</span>`;
    list.appendChild(div);
  });
}

function renderDeptBar(){
  const map = getDeptCounts();
  const labels = Object.keys(map);
  const values = Object.values(map);
  drawBarChart(document.getElementById('deptBar'), labels, values);
}

function renderUpdateLine(){
  const trend = getMonthlyTrend();
  const labels = Array.from({length:12},(_,i)=>`${i+1}月`);
  drawLineChart(document.getElementById('updateLine'), labels, trend);
}

function renderCharts(){
  if(!document.getElementById('deptBar')) return; // 未加载首页
  renderDeptBar();
  renderUpdateLine();
  if(!document.getElementById('statsChart').classList.contains('hidden')){
    renderStats();
  }
}

// 目录管理表格
function renderTable(){
  const dirs = getDirectories();
  const thead=document.querySelector('#dirTable thead');
  const tbody=document.querySelector('#dirTable tbody');
  thead.innerHTML='';
  tbody.innerHTML='';
  const headers=['名称','部门','共享级别','状态','更新时间'];
  const tr=document.createElement('tr');
  headers.forEach(h=>{
    const th=document.createElement('th');
    th.textContent=h;
    const resizer=document.createElement('div');
    resizer.className='resizer';
    resizer.addEventListener('mousedown',initResize);
    th.appendChild(resizer);
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  dirs.forEach(d=>{
    const row=document.createElement('tr');
    row.innerHTML=`<td>${d.name}</td><td>${d.department}</td><td>${d.shareLevel}</td><td>${d.status}</td><td>${d.lastUpdated}</td>`;
    tbody.appendChild(row);
  });
}

// 导出 CSV
function exportCSV(){
  const dirs = getDirectories();
  const headers=['名称','部门','共享级别','状态','更新时间'];
  const rows = dirs.map(d=>[d.name,d.department,d.shareLevel,d.status,d.lastUpdated]);
  const csv=[headers.join(','),...rows.map(r=>r.join(','))].join('\n');
  const link=document.createElement('a');
  link.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  link.download='directories.csv';
  link.click();
}

document.getElementById('exportCsv').addEventListener('click',exportCSV);

// 列宽拖动
let startX,startWidth,thEl;
function initResize(e){
  thEl = e.target.parentElement;
  startX = e.pageX;
  startWidth = thEl.offsetWidth;
  document.addEventListener('mousemove',onResize);
  document.addEventListener('mouseup',stopResize);
}
function onResize(e){
  const diff = e.pageX - startX;
  thEl.style.width = startWidth + diff + 'px';
}
function stopResize(){
  document.removeEventListener('mousemove',onResize);
  document.removeEventListener('mouseup',stopResize);
}

// 统计分析图
function renderStats(){
  const type=document.getElementById('chartType').value;
  const map=getDeptCounts();
  const labels=Object.keys(map);
  const values=Object.values(map);
  const canvas=document.getElementById('statsChart');
  if(type==='bar') drawBarChart(canvas,labels,values);
  if(type==='line') drawLineChart(canvas,labels,values);
  if(type==='pie') drawPieChart(canvas,labels,values);
}

document.getElementById('chartType').addEventListener('change',renderStats);
document.getElementById('exportPng').addEventListener('click',()=>exportPNG(document.getElementById('statsChart'),'stats.png'));

// 导航汉堡菜单
const navToggle=document.getElementById('nav-toggle');
navToggle.addEventListener('click',()=>{
  document.querySelector('.nav-list').classList.toggle('show');
});
