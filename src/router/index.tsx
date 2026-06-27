import { createBrowserRouter } from 'react-router';

import App from '../App';
import RoomVotePage from '../pages/room/RoomVotePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/rooms/:appointmentId',
    element: <RoomVotePage />,
  },
]);

export default router;
