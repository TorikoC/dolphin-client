import Home from '../components/Home';
import Room from '../components/Room';

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/room/:id',
    component: Room,
  },
];

export default routes;
