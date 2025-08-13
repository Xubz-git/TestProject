const { Card, List, Empty } = antd;
const { useEffect, useRef } = React;

export default function Dashboard({ datasets }) {
  const total = datasets.length;
  const categories = new Set(datasets.map(d => d.category)).size;
  const lastUpdated = datasets.reduce((max, d) => (d.lastUpdated > max ? d.lastUpdated : max), '');
  const recent = [...datasets]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 5);

  const lineRef = useRef();
  const today = dayjs();
  const days = Array.from({ length: 30 }, (_, i) => today.subtract(29 - i, 'day'));
  const counts = days.map(d => datasets.filter(ds => d.isSame(dayjs(ds.lastUpdated), 'day')).length);
  const hasData = counts.some(c => c > 0);

  useEffect(() => {
    if (!hasData) return;
    const chart = echarts.init(lineRef.current);
    chart.setOption({
      xAxis: { type: 'category', data: days.map(d => d.format('MM-DD')) },
      yAxis: { type: 'value', name: '更新次数/天' },
      tooltip: { trigger: 'axis' },
      series: [{ type: 'line', data: counts }]
    });
    return () => chart.dispose();
  }, [datasets]);

  return (
    React.createElement('div', { className: 'dashboard' },
      React.createElement('div', { className: 'stats' },
        React.createElement(Card, { title: '总量', style: { display: 'inline-block', marginRight: 16 } }, total),
        React.createElement(Card, { title: '类别数', style: { display: 'inline-block', marginRight: 16 } }, categories),
        React.createElement(Card, { title: '最近更新', style: { display: 'inline-block' } }, lastUpdated)
      ),
      React.createElement(Card, { title: '近30天更新频次', style: { marginTop: 16 } },
        hasData
          ? React.createElement('div', { ref: lineRef, style: { width: '100%', height: 300 } })
          : React.createElement(Empty, { image: Empty.PRESENTED_IMAGE_SIMPLE })
      ),
      React.createElement('div', { className: 'recent', style: { marginTop: 16 } },
        React.createElement(List, {
          header: '最近更新',
          dataSource: recent,
          renderItem: item => React.createElement(List.Item, null, `${item.name} (${item.lastUpdated})`)
        })
      )
    )
  );
}
