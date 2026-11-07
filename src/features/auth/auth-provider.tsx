import type { Session, User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { clearAccountData } from "@/features/account/clear-account-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  readLocalValue,
  readSessionValue,
  removeLocalValue,
  removeSessionValue,
  writeLocalValue,
  writeSessionValue,
} from "@/lib/device-storage";

const LOCAL_ACCOUNT_KEY = "mapleroute.account";

type LocalAccount = {
  email: string;
  firstName?: string;
  lastName?: string;
  nameConfirmed?: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  accountEmail: string | null;
  accountFirstName: string | null;
  accountLastName: string | null;
  needsName: boolean;
  accountKey: string | null;
  remoteUserId: string | null;
  signedIn: boolean;
  isLocalAccount: boolean;
  loading: boolean;
  configured: boolean;
  previewMode: boolean;
  signIn: (
    email: string,
    password: string,
    options?: { remember?: boolean },
  ) => Promise<{ needsName: boolean }>;
  signUp: (
    email: string,
    password: string,
    options?: { remember?: boolean; firstName?: string; lastName?: string },
  ) => Promise<{ needsConfirmation: boolean; needsName: boolean }>;
  setAccountName: (firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  enterPreview: () => void;
  exitPreview: () => void;
};

function cleanName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 40);
}

function metadataNames(user: User | null) {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const confirmed = meta.mapleroute_name_confirmed === true;
  const given = typeof meta.given_name === "string" ? cleanName(meta.given_name) : "";
  const family =
    typeof meta.family_name === "string" ? cleanName(meta.family_name) : "";
  if (given) return { firstName: given, lastName: family, confirmed };

  const full =
    typeof meta.full_name === "string"
      ? meta.full_name
      : typeof meta.name === "string"
        ? meta.name
        : "";
  const parts = cleanName(full).split(" ").filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    confirmed,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

function webOrigin() {
  if (Platform.OS !== "web" || typeof window === "undefined") return undefined;
  return window.location.origin;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [previewMode, setPreviewMode] = useState(false);
  const [localAccount, setLocalAccount] = useState<LocalAccount | null>(() =>
    isSupabaseConfigured
      ? null
      : (readLocalValue<LocalAccount>(LOCAL_ACCOUNT_KEY) ??
        readSessionValue<LocalAccount>(LOCAL_ACCOUNT_KEY) ??
        null),
  );

  const startLocalAccount = useCallback(
    (
      email: string,
      remember = true,
      names?: { firstName?: string; lastName?: string },
    ) => {
      const emailValue = email.trim();
      const account: LocalAccount = { email: emailValue };
      const firstName = cleanName(names?.firstName ?? "");
      const lastName = cleanName(names?.lastName ?? "");

      if (firstName) {
        account.firstName = firstName;
        account.lastName = lastName;
        account.nameConfirmed = true;
      } else {
        const existing =
          readLocalValue<LocalAccount>(LOCAL_ACCOUNT_KEY) ??
          readSessionValue<LocalAccount>(LOCAL_ACCOUNT_KEY);
        if (existing?.email.toLowerCase() === emailValue.toLowerCase()) {
          if (existing.firstName) account.firstName = existing.firstName;
          if (existing.lastName) account.lastName = existing.lastName;
          if (existing.nameConfirmed) account.nameConfirmed = true;
        }
      }

      setLocalAccount(account);
      if (remember) {
        writeLocalValue(LOCAL_ACCOUNT_KEY, account);
        removeSessionValue(LOCAL_ACCOUNT_KEY);
      } else {
        writeSessionValue(LOCAL_ACCOUNT_KEY, account);
        removeLocalValue(LOCAL_ACCOUNT_KEY);
      }
      return account;
    },
    [],
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string, options?: { remember?: boolean }) => {
      if (!supabase) {
        const account = startLocalAccount(email, options?.remember ?? true);
        return { needsName: !account.firstName || !account.nameConfirmed };
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      setSession(data.session);
      const names = metadataNames(data.session?.user ?? null);
      return { needsName: !names.firstName || !names.confirmed };
    },
    [startLocalAccount],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      options?: { remember?: boolean; firstName?: string; lastName?: string },
    ) => {
      if (!supabase) {
        const account = startLocalAccount(email, options?.remember ?? true, {
          firstName: options?.firstName,
          lastName: options?.lastName,
        });
        return {
          needsConfirmation: false,
          needsName: !account.firstName || !account.nameConfirmed,
        };
      }
      const firstName = cleanName(options?.firstName ?? "");
      const lastName = cleanName(options?.lastName ?? "");
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: webOrigin(),
          ...(firstName
            ? {
                data: {
                  given_name: firstName,
                  family_name: lastName,
                  mapleroute_name_confirmed: true,
                },
              }
            : {}),
        },
      });
      if (error) throw error;
      setSession(data.session);
      const names = data.session ? metadataNames(data.session.user) : null;
      return {
        needsConfirmation: !data.session,
        needsName: names ? !names.firstName || !names.confirmed : false,
      };
    },
    [startLocalAccount],
  );

  const setAccountName = useCallback(
    async (firstName: string, lastName: string) => {
      const first = cleanName(firstName);
      const last = cleanName(lastName);
      if (!first || !last) {
        throw new Error("Enter your first and last name.");
      }

      if (session && supabase) {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            given_name: first,
            family_name: last,
            mapleroute_name_confirmed: true,
          },
        });
        if (error) throw error;
        const user = data.user;
        if (user) {
          setSession((current) => (current ? { ...current, user } : current));
        }
        return;
      }

      if (localAccount) {
        const next: LocalAccount = {
          ...localAccount,
          firstName: first,
          lastName: last,
          nameConfirmed: true,
        };
        setLocalAccount(next);
        if (readLocalValue<LocalAccount>(LOCAL_ACCOUNT_KEY)) {
          writeLocalValue(LOCAL_ACCOUNT_KEY, next);
        } else {
          writeSessionValue(LOCAL_ACCOUNT_KEY, next);
        }
        return;
      }

      throw new Error("Sign in before adding your name.");
    },
    [session, localAccount],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error("Supabase is not configured yet.");
    if (Platform.OS !== "web") {
      throw new Error("Google sign-in is available on the web version first.");
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: webOrigin(),
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    setPreviewMode(false);
    setLocalAccount(null);
    removeLocalValue(LOCAL_ACCOUNT_KEY);
    removeSessionValue(LOCAL_ACCOUNT_KEY);
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const deleteAccount = useCallback(async () => {
    if (session && supabase) {
      const { error } = await supabase.rpc("delete_own_account");
      if (error) {
        throw new Error(
          "We couldn't delete the hosted account, so nothing was removed. Try again, or use the contact link in the Privacy policy.",
        );
      }
    }

    const key =
      session?.user.id ??
      (localAccount ? `local:${localAccount.email.toLowerCase()}` : null);
    clearAccountData(key);

    setPreviewMode(false);
    setLocalAccount(null);
    removeLocalValue(LOCAL_ACCOUNT_KEY);
    removeSessionValue(LOCAL_ACCOUNT_KEY);
    setSession(null);

    if (session && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // The hosted account is already gone.
      }
    }
  }, [session, localAccount]);

  const enterPreview = useCallback(() => setPreviewMode(true), []);
  const exitPreview = useCallback(() => setPreviewMode(false), []);

  const value = useMemo<AuthContextValue>(() => {
    const accountEmail = session?.user.email ?? localAccount?.email ?? null;
    const remoteUserId = session?.user.id ?? null;
    const accountKey =
      remoteUserId ??
      (localAccount ? `local:${localAccount.email.toLowerCase()}` : null);
    const names = session
      ? metadataNames(session.user)
      : localAccount
        ? {
            firstName: localAccount.firstName ?? "",
            lastName: localAccount.lastName ?? "",
            confirmed: localAccount.nameConfirmed === true,
          }
        : { firstName: "", lastName: "", confirmed: false };
    const signedIn = Boolean(session || previewMode || localAccount);

    return {
      session,
      user: session?.user ?? null,
      accountEmail,
      accountFirstName: names.firstName || null,
      accountLastName: names.lastName || null,
      needsName:
        signedIn && !previewMode && (!names.firstName || !names.confirmed),
      accountKey,
      remoteUserId,
      signedIn,
      isLocalAccount: Boolean(localAccount && !session),
      loading,
      configured: isSupabaseConfigured,
      previewMode,
      signIn,
      signUp,
      setAccountName,
      signInWithGoogle,
      signOut,
      deleteAccount,
      enterPreview,
      exitPreview,
    };
  }, [
    session,
    localAccount,
    loading,
    previewMode,
    signIn,
    signUp,
    setAccountName,
    signInWithGoogle,
    signOut,
    deleteAccount,
    enterPreview,
    exitPreview,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}

export function authErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Something went wrong. Try again.";
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "That email and password don't match. Check them and try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email first. We sent you a link when you signed up.";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (lower.includes("password should be at least")) {
    return "Use a password with at least 8 characters.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Wait a minute, then try again.";
  }
  if (lower.includes("supabase is not configured")) {
    return "Accounts aren't connected yet. Add your Supabase keys first.";
  }
  if (lower.includes("google sign-in is available")) {
    return "Google sign-in is available on the web version first.";
  }
  return message;
}
