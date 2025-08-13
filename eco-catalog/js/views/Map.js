const { Card } = antd;
const { useEffect, useRef } = React;

export default function Map({ datasets }) {
  const ref = useRef();

  useEffect(() => {
    let chart;
    fetch('./data/geo/province.geojson')
      .then(r => r.json())
      .then(geo => {
        echarts.registerMap('province', geo);
        const data = geo.features.map(f => {
          const name = f.properties.name;
          const matched = datasets.filter(d => (d.coverage && d.coverage.includes(name)) || (d.city && d.city.includes(name)));
          const count = matched.length;
          const latest = matched.reduce((m, d) => d.lastUpdated > m ? d.lastUpdated : m, '');
          return { name, value: count, latest };
        });
        const max = Math.max(...data.map(d => d.value), 0);
        const pieces = [
          { value: 0, color: '#ddd', label: '0' },
          { min: 1, max: Math.max(1, Math.floor(max / 2)), color: '#8dcff8', label: '1-' + Math.max(1, Math.floor(max / 2)) },
          { min: Math.max(1, Math.floor(max / 2)) + 1, color: '#1677ff', label: (Math.max(1, Math.floor(max / 2)) + 1) + '-' + max }
        ];
        chart = echarts.init(ref.current);
        chart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: p => `${p.name}<br/>数量: ${p.data.value}<br/>最近: ${p.data.latest || '-'}`
          },
          visualMap: {
            type: 'piecewise',
            left: 'left',
            bottom: 0,
            pieces
          },
          series: [{
            type: 'map',
            map: 'province',
            data,
            roam: false,
            label: { show: false }
          }]
        });
        chart.on('click', params => {
          window.location.hash = `#/catalog?city=${encodeURIComponent(params.name)}`;
        });
      });
    return () => { chart && chart.dispose(); };
  }, [datasets]);

  return React.createElement(Card, { title: '覆盖地图' },
    React.createElement('div', { ref, style: { width: '100%', height: 360 } })
  );
}
