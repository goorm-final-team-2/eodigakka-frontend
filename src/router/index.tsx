import { createBrowserRouter } from 'react-router';

import App from '../App';

import { ROUTES } from '@/constants/routes';
import { LocationSharePage } from '@/pages/LocationSharePage';

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <App />,
  },
  {
    path: ROUTES.LOCATION_SHARE,
    element: <LocationSharePage />,
  },
]);

export default router;
