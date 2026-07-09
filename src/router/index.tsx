import { createBrowserRouter } from 'react-router';

import App from '../App';
import LoginPage from '../pages/LoginPage';
import KakaoCallbackPage from '../pages/oauth/KakaoCallbackPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/oauth/kakao/callback',
    element: <KakaoCallbackPage />,
  },
]);

export default router;
