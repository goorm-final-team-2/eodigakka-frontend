import { createBrowserRouter } from 'react-router';

import App from '../App';
import LoginPage from '../pages/LoginPage';
import KakaoCallbackPage from '../pages/oauth/KakaoCallbackPage';

import { ROUTES } from '@/constants/routes';
import { LocationSharePage } from '@/pages/LocationSharePage';
import LoginPage from '@/pages/LoginPage';
import KakaoCallbackPage from '@/pages/oauth/KakaoCallbackPage';

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <App />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.KAKAO_CALLBACK,
    element: <KakaoCallbackPage />,
  },
  {
    path: ROUTES.LOCATION_SHARE,
    element: <LocationSharePage />,
  },
]);

export default router;
