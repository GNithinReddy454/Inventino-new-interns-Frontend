export type SessionKind = "guest" | "user" | "admin";

const parseStoredUser = (): any | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("inventino_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getSessionKind = (): SessionKind => {
  if (typeof window === "undefined") return "guest";

  const token = localStorage.getItem("token");
  if (!token) return "guest";

  const storedUser = parseStoredUser();
  if (!storedUser) return "guest";

  if (Array.isArray(storedUser.permissions)) return "admin";

  return "user";
};

export const hasUserSession = (): boolean => getSessionKind() === "user";

export const hasAdminSession = (): boolean => getSessionKind() === "admin";
