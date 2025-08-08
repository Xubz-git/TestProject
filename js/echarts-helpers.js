// ECharts 辅助函数
// initChart: 初始化图表并处理销毁与窗口缩放
export function initChart(dom, theme){
  if(dom._chart){
    dom._chart.dispose();
    window.removeEventListener('resize', dom._resize);
  }
  const chart = echarts.init(dom, theme);
  const resize = throttle(()=>{chart.resize();},200);
  window.addEventListener('resize', resize);
  dom._chart = chart;
  dom._resize = resize;
  return chart;
}

// setOptions: 设置通用 option
export function setOptions(chart, option){
  chart.setOption(option, {notMerge:true, lazyUpdate:true});
}

// exportPng: 导出 PNG 图
export function exportPng(chart, filename){
  const url = chart.getDataURL({type:'png', pixelRatio:2});
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

// 简易节流
function throttle(fn, delay){
  let t;
  return function(){
    clearTimeout(t);
    t = setTimeout(fn, delay);
  };
}
