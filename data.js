// 示例数据与数据 API
const seedData = [
  {id:'1',name:'地表水质监测月报',department:'水生态环境处',tags:['水质','监测'],shareLevel:'开放',status:'有效',lastUpdated:'2025-07-15'},
  {id:'2',name:'空气质量日报',department:'大气环境处',tags:['空气','监测'],shareLevel:'共享',status:'有效',lastUpdated:'2025-07-10'},
  {id:'3',name:'土壤污染场地名录',department:'土壤生态环境处',tags:['土壤'],shareLevel:'内部',status:'停用',lastUpdated:'2025-06-20'},
  {id:'4',name:'危险废物产生单位名录',department:'固体废物处',tags:['废物'],shareLevel:'开放',status:'有效',lastUpdated:'2025-07-05'},
  {id:'5',name:'噪声污染源信息',department:'噪声与辐射处',tags:['噪声'],shareLevel:'共享',status:'有效',lastUpdated:'2025-07-01'},
  {id:'6',name:'排污许可证清单',department:'行政审批处',tags:['排污'],shareLevel:'开放',status:'有效',lastUpdated:'2025-07-18'},
  {id:'7',name:'生态红线区划数据',department:'自然生态处',tags:['生态'],shareLevel:'共享',status:'有效',lastUpdated:'2025-05-30'},
  {id:'8',name:'机动车尾气监测',department:'机动车排污处',tags:['尾气'],shareLevel:'开放',status:'有效',lastUpdated:'2025-07-16'}
];

// 初始化 localStorage
export function initData(){
  if(!localStorage.getItem('directories')){
    localStorage.setItem('directories', JSON.stringify(seedData));
  }
}

// 获取全部目录
export function getDirectories(){
  return JSON.parse(localStorage.getItem('directories')) || [];
}

// 统计数据
export function getMetrics(){
  const dirs = getDirectories();
  const total = dirs.length;
  const open = dirs.filter(d=>d.shareLevel==='开放').length;
  const departments = new Set(dirs.map(d=>d.department)).size;
  const month = new Date().getMonth()+1;
  const monthAdd = dirs.filter(d=>new Date(d.lastUpdated).getMonth()+1===month).length;
  return {total,open,departments,monthAdd};
}

// 最近更新列表
export function getRecentUpdates(){
  const dirs = getDirectories().slice().sort((a,b)=>new Date(b.lastUpdated)-new Date(a.lastUpdated));
  return dirs.slice(0,5).map(d=>({date:d.lastUpdated,name:d.name}));
}

// 部门目录数量
export function getDeptCounts(){
  const map = {};
  getDirectories().forEach(d=>{map[d.department]=(map[d.department]||0)+1;});
  return map; // {dept:count}
}

// 近12个月更新趋势
export function getMonthlyTrend(){
  const result = Array(12).fill(0);
  const now = new Date();
  const dirs = getDirectories();
  dirs.forEach(d=>{
    const date = new Date(d.lastUpdated);
    const diff = (now.getFullYear()-date.getFullYear())*12 + now.getMonth() - date.getMonth();
    if(diff>=0 && diff<12){result[11-diff]++;}
  });
  return result; // 从12个月前到本月
}

// 共享级别统计
export function getShareLevelCounts(){
  const map = {};
  getDirectories().forEach(d=>{map[d.shareLevel]=(map[d.shareLevel]||0)+1;});
  return map; // {shareLevel:count}
}
