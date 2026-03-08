import React from 'react';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

import { CustomLayout } from './layout/CustomLayout';
// import { LazyLanding } from './component/landing/LazyLanding';
// import { LazyPage2 } from './component/LazyPage2';
// import { LazyPage3 } from './component/LazyPage3';
import { DSAAnalysis } from './component/DSAAnalysis';

const App = () => (
  <ConfigProvider locale={enUS}>
    <CustomLayout>
      <DSAAnalysis />
    </CustomLayout>
  </ConfigProvider>
);

// eslint-disable-next-line import/no-default-export
export default App;
