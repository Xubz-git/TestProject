const { Descriptions, Table, Button, Drawer, Tag } = antd;
const { useState, useRef } = React;

export default function Detail({ dataset }) {
  const [open, setOpen] = useState(false);
  if (!dataset) {
    return React.createElement('div', null, '未找到数据集');
  }
  const logged = useRef(false);
  const columns = [
    { title: '字段名', dataIndex: 'name' },
    { title: '类型', dataIndex: 'type' },
    { title: '说明', dataIndex: 'description', ellipsis: true },
    {
      title: '敏感级别',
      dataIndex: 'level',
      render: lvl => {
        const level = lvl || '公开';
        if (!lvl && !logged.current) {
          console.info('fields.level 缺失，已默认填充为 公开');
          logged.current = true;
        }
        const color = level === '敏感' ? 'error' : level === '内部' ? 'default' : 'processing';
        return React.createElement(Tag, { color }, level);
      }
    }
  ];
  return (
    React.createElement('div', null,
      React.createElement(Descriptions, { title: dataset.name, bordered: true, column: 1 },
        React.createElement(Descriptions.Item, { label: '牵头处室' }, dataset.department),
        React.createElement(Descriptions.Item, { label: '分类' }, dataset.category),
        React.createElement(Descriptions.Item, { label: '更新频率' }, dataset.updateFrequency),
        React.createElement(Descriptions.Item, { label: '格式' }, dataset.format),
        React.createElement(Descriptions.Item, { label: '最近更新' }, dataset.lastUpdated)
      ),
      React.createElement('p', { style: { marginTop: 16 } }, dataset.description),
      React.createElement(Table, {
        style: { marginTop: 16 },
        dataSource: dataset.fields,
        columns,
        rowKey: 'name',
        pagination: false
      }),
      React.createElement(Button, {
        type: 'primary',
        style: { marginTop: 16 },
        onClick: () => setOpen(true)
      }, '下载'),
      React.createElement(Drawer, {
        title: '下载',
        placement: 'right',
        open,
        width: 300,
        onClose: () => setOpen(false)
      },
        React.createElement('a', {
          href: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataset))}`,
          download: `${dataset.id}.json`
        }, '下载 JSON')
      )
    )
  );
}
