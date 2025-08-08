// 简易图表绘制
function drawBarChart(canvas, labels, data){
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  const max = Math.max(...data) || 1;
  const bw = w / data.length;
  data.forEach((v,i)=>{
    const bh = v/max * (h-20);
    ctx.fillStyle = '#5ba368';
    ctx.fillRect(i*bw+10, h-bh-10, bw-20, bh);
    ctx.fillStyle = '#333';
    ctx.fillText(labels[i], i*bw+15, h-5);
  });
}

function drawPieChart(canvas, labels, data){
  const ctx = canvas.getContext('2d');
  const total = data.reduce((a,b)=>a+b,0)||1;
  let start = 0;
  const colors = ['#5ba368','#4f81bd','#a5a5a5','#ffc000','#9bbb59'];
  data.forEach((v,i)=>{
    const angle = v/total * Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(150,75);
    ctx.fillStyle = colors[i%colors.length];
    ctx.arc(150,75,70,start,start+angle);
    ctx.closePath();
    ctx.fill();
    start += angle;
  });
}

function drawLineChart(canvas, labels, data){
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  const max = Math.max(...data) || 1;
  ctx.beginPath();
  data.forEach((v,i)=>{
    const x = i/(data.length-1) * (w-20) +10;
    const y = h - (v/max * (h-20)) -10;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle = '#005bac';
  ctx.stroke();
}

function exportPNG(canvas, name){
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = name;
  link.click();
}
