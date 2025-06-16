import { createCookieSessionStorage } from 'react-router';

type SessionData = {
  userId: string;
  username: string;
  token: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      maxAge: 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
    },
  });

export { getSession, commitSession, destroySession };
