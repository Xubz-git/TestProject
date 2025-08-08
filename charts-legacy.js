// 已弃用的 Chart.js 实现，仅作历史保留

// 简易图表绘制工具
function getColor(){
  return getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
}

export function drawBarChart(canvas, labels, values){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const w = canvas.width / values.length;
  const max = Math.max(...values) || 1;
  ctx.fillStyle = getColor();
  values.forEach((v,i)=>{
    const h = v/max* (canvas.height-20);
    ctx.fillRect(i*w+10, canvas.height-h-10, w-20, h);
  });
  ctx.fillStyle = getComputedStyle(document.body).color;
  ctx.font='12px sans-serif';
  labels.forEach((l,i)=>{ctx.fillText(l,i*w+10,canvas.height-2);});
}

export function drawLineChart(canvas, labels, values){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const max = Math.max(...values) || 1;
  const stepX = (canvas.width-20)/(values.length-1);
  ctx.strokeStyle = getColor();
  ctx.beginPath();
  values.forEach((v,i)=>{
    const x = 10 + i*stepX;
    const y = canvas.height-10 - v/max*(canvas.height-20);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
  ctx.fillStyle = getComputedStyle(document.body).color;
  ctx.font='12px sans-serif';
  labels.forEach((l,i)=>{ctx.fillText(l,10+i*stepX,canvas.height-2);});
}

export function drawPieChart(canvas, labels, values){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const total = values.reduce((a,b)=>a+b,0) || 1;
  let start=0;
  values.forEach((v,i)=>{
    const angle = v/total*2*Math.PI;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2,canvas.height/2);
    ctx.fillStyle = shadeColor(getColor(), i*15);
    ctx.arc(canvas.width/2,canvas.height/2,Math.min(canvas.width,canvas.height)/2-10,start,start+angle);
    ctx.closePath();
    ctx.fill();
    start+=angle;
  });
}

function shadeColor(color, percent){
  const f=parseInt(color.slice(1),16),t=percent<0?0:255,p=Math.abs(percent)/100,
  R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  const newColor = '#'+(0x1000000+ (Math.round((t-R)*p)+R)*0x10000 + (Math.round((t-G)*p)+G)*0x100 + (Math.round((t-B)*p)+B)).toString(16).slice(1);
  return newColor;
}

// 导出 PNG
export function exportPNG(canvas, name){
  const link = document.createElement('a');
  link.download = name;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
