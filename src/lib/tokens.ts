export const setAccessToken = (token: string): void => {
  localStorage.setItem("access_token", token);
};

export const getAccessToken = (): string | null => {
  return typeof localStorage === "object"
    ? localStorage.getItem("access_token")
    : null;
};

export const removeAccessToken = (): void => {
  if (getAccessToken() != null) localStorage.removeItem("access_token");
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem("refresh_token", token);
};

export const getRefreshToken = (): string | null => {
  return typeof localStorage === "object"
    ? localStorage.getItem("refresh_token")
    : null;
};

export const removeRefreshToken = (): void => {
  if (getRefreshToken() != null) localStorage.removeItem("refresh_token");
};

export const setTokens = ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
};

export const removeTokens = (): void => {
  removeAccessToken();
  removeRefreshToken();
};
