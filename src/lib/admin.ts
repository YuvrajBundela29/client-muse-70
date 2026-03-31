// GOD ADMIN — the single email that has full control
export const GOD_ADMIN_EMAIL = "bundelayuvraj29@gmail.com";

export function isGodAdmin(email: string | null | undefined): boolean {
  return email?.toLowerCase() === GOD_ADMIN_EMAIL;
}
