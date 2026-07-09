import { createBrowserRouter } from 'react-router';

import App from '../App';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import { ROUTES } from '@/constants/routes';
import { LocationSharePage } from '@/pages/LocationSharePage';
import LoginPage from '@/pages/LoginPage';
import KakaoCallbackPage from '@/pages/oauth/KakaoCallbackPage';
import RoomVotePage from '@/pages/room/RoomVotePage';

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.KAKAO_CALLBACK,
    element: <KakaoCallbackPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.HOME,
        element: <App />,
      },
      {
        path: ROUTES.ROOM,
        element: <RoomVotePage />,
      },
      {
        path: ROUTES.LOCATION_SHARE,
        element: <LocationSharePage />,
      },
    ],
  },
]);

export default router;
