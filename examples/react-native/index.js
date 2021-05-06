/**
 * @format
 */

import Config from 'react-native-config';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import DashX from '@dashx/react-native';

DashX.setLogLevel(0);

DashX.setup({
  publicKey: Config.DASHX_PUBLIC_KEY,
  baseUri: 'http://api.dashx-local.com:8080/graphql',
  accountType: 'individual',
});

DashX.identify({ firstName: 'John', lastName: 'Doe' });

DashX.track('Added Product to Cart', {
  productId: 101,
  price: 14.99,
  size: 'large',
  isFeatured: true,
  coupon: null
});

AppRegistry.registerComponent(appName, () => App);
