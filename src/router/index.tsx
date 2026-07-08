import { createBrowserRouter } from 'react-router';

import App from '../App';
import KakaoCallbackPage from '../pages/oauth/KakaoCallbackPage';
import LoginPage from '../pages/LoginPage';

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