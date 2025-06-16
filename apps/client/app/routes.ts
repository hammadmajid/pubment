import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/login', 'routes/login.tsx'),
  route('/register', 'routes/register.tsx'),
  route('/user/:username', 'routes/user.tsx'),
  route('/feed', 'routes/feed.tsx'),
  route('/search', 'routes/search.tsx'),
  route('/settings', 'routes/settings.tsx'),
  route('/post/:postId', 'routes/post.tsx'),
] satisfies RouteConfig;
