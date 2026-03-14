import React, { ReactNode, useState, useEffect } from 'react';
import type { MenuDataItem } from '@ant-design/pro-components';
import { PageContainer, ProLayout } from '@ant-design/pro-components';
import { notification } from 'antd';
import { copyText } from 'copy-clipboard-js';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import MenuFoldOutlined from '@ant-design/icons/MenuFoldOutlined';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';
import logo from './logo.svg';

const defaultMenus: MenuDataItem[] = [
  {
    path: '/',
    name: 'Landing Page',
    icon: <HomeOutlined />,
  },
  {
    path: '/analysis/',
    name: 'Application',
    icon: <AppstoreOutlined />,
  },
  {
    path: '/docs/',
    name: 'Documentation',
    icon: <FileTextOutlined />,
  },
  {
    path: '/users/',
    name: 'Users',
    icon: <UserOutlined />,
  },
  {
    path: '/logs/',
    name: 'Activity Logs',
    icon: <CopyOutlined />,
  }
];

const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({ icon, children, ...item }) => ({
    ...item,
    icon,
    children: children && loopMenuItem(children),
    path: item.path,
  }));

interface ICustomFooterMenuProps {
  collapsed?: boolean;
}

// @ts-ignore
const TRACE: string = __HEAD_COMMIT_HASH__;

const CustomFooterMenu = ({ collapsed }: ICustomFooterMenuProps) => {
  const [api, contextHolder] = notification.useNotification();

  const copyLink = () => {
    copyText(TRACE);
    api.open({
      key: TRACE,
      message: 'Trace ID copied to clipboard',
      description: `ID: ${TRACE}`,
      duration: 2,
      closeIcon: <div />,
    });
  };

  if (collapsed) return undefined;
  return (
    <>
      {contextHolder}
      <div style={{ textAlign: 'center' }}>
        <div style={{ textAlign: 'center', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
          <div>
            { /* @ts-ignore */}
            {TRACE ? `Trace: ${TRACE}` : ''}
            <CopyOutlined onClick={() => copyLink()} />
          </div>
          <div>
            &copy; {new Date().getFullYear()} - DSS
          </div>
        </div>
      </div>
    </>
  );
};

const renderMenuItem = (item: any, dom: React.ReactNode) => <a href={item.path || '/'}>{dom}</a>;

const subMenuItemRender = (item: any, dom: React.ReactNode) => <a href={item.path || '/'}>{dom}</a>;

interface ICustomLayoutProps {
  children: ReactNode;
}

const CustomLayout = ({ children }: ICustomLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ProLayout
      logo={logo}
      title="DSS"
      style={{ minHeight: '100vh' }}
      fixSiderbar
      collapsed={collapsed}
      onCollapse={(collapsed) => setCollapsed(collapsed)}
      breakpoint={false}
      menu={{
        request: async () => loopMenuItem(defaultMenus),
      }}
      route={{ routes: defaultMenus }}
      menuItemRender={renderMenuItem}
      subMenuItemRender={subMenuItemRender}
      menuFooterRender={(props) => <CustomFooterMenu {...props} />}
      menuExtraRender={({ collapsed: isCollapsed }) => 
        !isMobile && (
          <div 
            onClick={() => setCollapsed(!isCollapsed)} 
            style={{ 
              cursor: 'pointer', 
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: '1rem',
            }}
          >
            {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        )
      }
    >
      <PageContainer header={{ title: true }}>
        <div style={{ 
          padding: isMobile ? '0.75rem' : 16, 
          background: 'transparent',
          width: '100%',
        }}>
          {children}
        </div>
      </PageContainer>
    </ProLayout>
  );
};

export { CustomLayout };
