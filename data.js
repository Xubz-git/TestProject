// 数据与设置管理
const STORAGE_KEY = 'catalogData';
const SETTINGS_KEY = 'appSettings';

// 读取数据，若为空则生成示例数据
function loadData() {
  let data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!data || !data.length) {
    data = generateSampleData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}
function saveData(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// 读取设置
function loadSettings(){
  let s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  if(!s){
    s = { province:'某省', theme:'light', pageSize:10 };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }
  document.body.setAttribute('data-theme', s.theme);
  return s;
}
function saveSettings(s){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

// 生成 40-80 条示例数据
function generateSampleData(){
  const departments = ['生态环境监测处','科技处','综合规划处','信息中心','自然生态保护处'];
  const tags = ['空气','水质','土壤','排污','减排','法规','年度'];
  const types = ['开放','共享','内部'];
  const statusList = ['有效','停用'];
  const data = [];
  const count = Math.floor(Math.random()*40)+40; //40-80
  for(let i=1;i<=count;i++){
    data.push({
      id: i,
      name: `数据资源${i}`,
      department: departments[Math.floor(Math.random()*departments.length)],
      tags: shuffle(tags).slice(0, Math.floor(Math.random()*3)+1),
      type: types[Math.floor(Math.random()*types.length)],
      status: statusList[Math.floor(Math.random()*statusList.length)],
      updated: randomDate(),
      history: []
    });
  }
  return data;
}

// 工具函数
function shuffle(arr){ return arr.sort(()=>Math.random()-0.5); }
function randomDate(){
  const now = Date.now();
  const past = now - 365*24*3600*1000;
  return new Date(past + Math.random()*(now-past)).toISOString().split('T')[0];
}
