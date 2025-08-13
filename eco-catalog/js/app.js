import Dashboard from './views/Dashboard.js';
import Catalog from './views/Catalog.js';
import Detail from './views/Detail.js';
import About from './views/About.js';
import Map from './views/Map.js';

const { Layout, Menu, Alert, Drawer, Button } = antd;
const { useState, useEffect } = React;
const { GlobalOutlined, MenuOutlined } = icons;

function validateSchema(data) {
  if (!Array.isArray(data)) return '数据集应为数组';
  const required = ['id', 'name', 'department', 'category', 'updateFrequency', 'format', 'lastUpdated', 'fields', 'description'];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    for (const key of required) {
      if (!(key in item)) {
        return `数据项 ${i} 缺少字段 ${key}`;
      }
    }
  }
  return null;
}

function App() {
  const [datasets, setDatasets] = useState([]);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [width, setWidth] = useState(window.innerWidth);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('./data/datasets.json');
        const json = await res.json();
        const err = validateSchema(json);
        if (err) setError(err);
        else setDatasets(json);
      } catch (e) {
        console.error('Failed to load datasets.json', e);
        setError(e.message);
        setDatasets([
          {
            id: 'offline-sample',
            name: '离线示例数据',
            department: '示例处室',
            category: '示例类别',
            updateFrequency: '一次性',
            format: 'CSV',
            lastUpdated: '1970-01-01',
            fields: [],
            description: '离线内置样本'
          }
        ]);
      }
    })();
  }, []);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/');
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const renderRoute = () => {
    const path = route.split('?')[0];
    if (path === '#/catalog') return React.createElement(Catalog, { datasets, route });
    if (path === '#/map') return React.createElement(Map, { datasets });
    if (path.startsWith('#/detail')) {
      const id = new URLSearchParams(route.split('?')[1]).get('id');
      const ds = datasets.find(d => d.id === id);
      return React.createElement(Detail, { dataset: ds });
    }
    if (path === '#/about') return React.createElement(About);
    return React.createElement(Dashboard, { datasets });
  };

  const isMobile = width <= 768;
  const isDesktop = width >= 1024;
  const menuItems = [
    { label: '概览', key: '#/' },
    { label: '目录', key: '#/catalog' },
    { label: '覆盖地图', key: '#/map', icon: React.createElement(GlobalOutlined) },
    { label: '关于', key: '#/about' }
  ];
  const menu = React.createElement(Menu, {
    theme: 'dark',
    selectedKeys: [route.split('?')[0]],
    items: menuItems,
    onClick: ({ key }) => { window.location.hash = key; setDrawer(false); }
  });

  return (
    React.createElement(Layout, { style: { minHeight: '100vh' } },
      !isMobile && React.createElement(Layout.Sider, { className: 'site-layout-sider', collapsed: !isDesktop, collapsedWidth: 80 }, menu),
      React.createElement(Layout, null,
        React.createElement(Layout.Header, { style: { background: 'var(--brand-blue)', display: 'flex', alignItems: 'center' } },
          isMobile && React.createElement(Button, { type: 'text', icon: React.createElement(MenuOutlined), onClick: () => setDrawer(true), style: { color: '#fff', marginRight: 16 } }),
          '生态环境数据资源目录'
        ),
        React.createElement(Layout.Content, { style: { padding: 24 } },
          error && React.createElement(Alert, { type: 'error', message: error, style: { marginBottom: 16 } }),
          renderRoute()
        )
      ),
      isMobile && React.createElement(Drawer, { placement: 'left', open: drawer, onClose: () => setDrawer(false), bodyStyle: { padding: 0 } }, menu)
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
