export function getLoggedInUserId() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("user_acc_id");
  }
  return null;
}

export function getLoggedInUserRole() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("user_role");
  }
  return null;
}
