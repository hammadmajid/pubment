export function getToken() {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1] || null
  );
}

export function setToken(token: string) {
  document.cookie = `token=${token}; path=/; domain=${window.location.hostname}`;
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  document.cookie =
    'token=; Max-Age=0; path=/; domain=' + window.location.hostname;
}

export function setUserId(userId: string) {
  document.cookie = `userId=${userId}; path=/; domain=${window.location.hostname}`;
}

export function getUserId() {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('userId='))
      ?.split('=')[1] || null
  );
}
