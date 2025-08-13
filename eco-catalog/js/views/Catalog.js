const { useState, useMemo, useEffect } = React;
const { Input, Table, Select, Space, Button, Dropdown, Menu } = antd;
const { DownOutlined } = icons;

function exportZip(data) {
  const zip = new JSZip();
  zip.file('catalog.json', JSON.stringify(data, null, 2));
  const header = 'id,name,bureau,category,updateFreq,format,updatedAt\n';
  const rows = data.map(d => [d.id, d.name, d.department, d.category, d.updateFrequency, d.format, d.lastUpdated].join(','));
  zip.file('catalog.csv', header + rows.join('\n'));
  const name = dayjs().format('YYYYMMDD-HHmm');
  zip.generateAsync({ type: 'blob' }).then(blob => {
    saveAs(blob, `catalog-${name}.zip`);
  });
}

export default function Catalog({ datasets, route }) {
  const categories = useMemo(() => Array.from(new Set(datasets.map(d => d.category))), [datasets]);
  const departments = useMemo(() => Array.from(new Set(datasets.map(d => d.department))), [datasets]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [mobile, setMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const cityParam = useMemo(() => {
    const q = route.split('?')[1];
    return q ? new URLSearchParams(q).get('city') : '';
  }, [route]);

  const filtered = datasets.filter(d => {
    return (
      d.name.includes(search) &&
      (!category || d.category === category) &&
      (!department || d.department === department) &&
      (!cityParam || (d.coverage && d.coverage.includes(cityParam)))
    );
  });

  const columns = [
    { title: '名称', dataIndex: 'name', ellipsis: true },
    { title: '牵头处室', dataIndex: 'department' },
    { title: '分类', dataIndex: 'category' },
    { title: '更新频率', dataIndex: 'updateFrequency' },
    { title: '格式', dataIndex: 'format' },
    {
      title: '最近更新',
      dataIndex: 'lastUpdated',
      sorter: (a, b) => a.lastUpdated.localeCompare(b.lastUpdated)
    }
  ];

  return (
    React.createElement('div', null,
      React.createElement('div', { className: 'catalog-toolbar' },
        React.createElement(Space, { className: 'filters' },
          React.createElement(Input, {
            placeholder: '搜索',
            value: search,
            onChange: e => setSearch(e.target.value)
          }),
          React.createElement(Select, {
            allowClear: true,
            placeholder: '分类',
            value: category || undefined,
            onChange: v => setCategory(v),
            options: categories.map(c => ({ value: c, label: c }))
          }),
          React.createElement(Select, {
            allowClear: true,
            placeholder: '处室',
            value: department || undefined,
            onChange: v => setDepartment(v),
            options: departments.map(d => ({ value: d, label: d }))
          })
        ),
        mobile
          ? React.createElement(Dropdown, {
              overlay: React.createElement(Menu, { onClick: ({ key }) => { if (key === 'zip') exportZip(filtered); } },
                React.createElement(Menu.Item, { key: 'zip' }, '导出 ZIP')
              )
            },
            React.createElement(Button, null, '操作 ', React.createElement(DownOutlined))
          )
          : React.createElement(Button, { onClick: () => exportZip(filtered) }, '导出 ZIP')
      ),
      React.createElement(Table, {
        className: 'catalog-table',
        dataSource: filtered,
        columns,
        rowKey: 'id',
        size: 'small',
        pagination: { pageSize: 5 },
        onRow: record => ({
          onClick: () => window.location.hash = `#/detail?id=${record.id}`
        })
      })
    )
  );
}
