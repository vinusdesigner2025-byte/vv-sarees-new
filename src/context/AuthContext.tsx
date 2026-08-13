import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  User as SupabaseUser,
} from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";


type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};


type AuthResult = {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
};


type AuthContextValue = {
  user: User | null;

  isLoggedIn: boolean;

  isAuthLoading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<AuthResult>;

  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResult>;

  loginWithGoogle:
    () => Promise<AuthResult>;

  logout:
    () => Promise<void>;
};


const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );


type AuthProviderProps = {
  children: ReactNode;
};


/* =========================================
   FORMAT SUPABASE USER
========================================= */

const formatUser = (
  authUser: SupabaseUser
): User => {
  const metadata =
    authUser.user_metadata ?? {};

  const name =
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    authUser.email?.split("@")[0] ||
    "VV Sarees Customer";

  const avatarUrl =
    metadata.avatar_url ||
    metadata.picture ||
    "";

  return {
    id: authUser.id,

    name:
      String(name),

    email:
      authUser.email ?? "",

    avatarUrl:
      String(avatarUrl),
  };
};


const getErrorMessage = (
  error: unknown
) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(error.message);
  }

  return "Something went wrong.";
};


/* =========================================
   AUTH PROVIDER
========================================= */

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [
    isAuthLoading,
    setIsAuthLoading,
  ] = useState(true);


  /* =========================================
     INITIAL SESSION + AUTH LISTENER
  ========================================= */

  useEffect(() => {
    let mounted = true;


    const loadSession = async () => {
      try {
        const {
          data: {
            session,
          },
          error,
        } =
          await supabase.auth
            .getSession();


        if (!mounted) {
          return;
        }


        if (error) {
          console.error(
            "Initial auth session error:",
            error
          );

          setUser(null);
          return;
        }


        if (
          session?.user
        ) {
          setUser(
            formatUser(
              session.user
            )
          );
        } else {
          setUser(null);
        }
      } catch (
        error
      ) {
        console.error(
          "Auth session load error:",
          error
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsAuthLoading(
            false
          );
        }
      }
    };


    /*
     * Register listener before / alongside
     * initial session loading so OAuth
     * SIGNED_IN event isn't missed.
     */
    const {
      data: {
        subscription,
      },
    } =
      supabase.auth
        .onAuthStateChange(
          (
            event,
            session
          ) => {
            if (!mounted) {
              return;
            }


            console.log(
              "Supabase auth event:",
              event
            );


            if (
              session?.user
            ) {
              setUser(
                formatUser(
                  session.user
                )
              );
            } else {
              setUser(null);
            }


            setIsAuthLoading(
              false
            );
          }
        );


    void loadSession();


    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);


  /* =========================================
     EMAIL LOGIN
  ========================================= */

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const cleanedEmail =
        email
          .trim()
          .toLowerCase();


      const {
        data,
        error,
      } =
        await supabase.auth
          .signInWithPassword({
            email:
              cleanedEmail,

            password,
          });


      if (error) {
        return {
          success: false,

          error:
            error.message,
        };
      }


      if (
        data.session?.user
      ) {
        setUser(
          formatUser(
            data.session.user
          )
        );
      }


      return {
        success: true,
      };
    } catch (
      error
    ) {
      return {
        success: false,

        error:
          getErrorMessage(
            error
          ),
      };
    }
  };


  /* =========================================
     SIGN UP
  ========================================= */

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      const cleanedEmail =
        email
          .trim()
          .toLowerCase();

      const cleanedName =
        name.trim();


      const {
        data,
        error,
      } =
        await supabase.auth
          .signUp({
            email:
              cleanedEmail,

            password,

            options: {
              data: {
                full_name:
                  cleanedName,
              },

              emailRedirectTo:
                `${window.location.origin}/my-account`,
            },
          });


      if (error) {
        return {
          success: false,

          error:
            error.message,
        };
      }


      if (
        data.session?.user
      ) {
        setUser(
          formatUser(
            data.session.user
          )
        );

        return {
          success: true,
        };
      }


      return {
        success: true,

        needsEmailConfirmation:
          true,
      };
    } catch (
      error
    ) {
      return {
        success: false,

        error:
          getErrorMessage(
            error
          ),
      };
    }
  };


  /* =========================================
     GOOGLE LOGIN
  ========================================= */

  const loginWithGoogle =
    async (): Promise<AuthResult> => {
      try {
        const {
          error,
        } =
          await supabase.auth
            .signInWithOAuth({
              provider:
                "google",

              options: {
                redirectTo:
                  `${window.location.origin}/my-account`,
              },
            });


        if (error) {
          return {
            success: false,

            error:
              error.message,
          };
        }


        /*
         * Browser redirects to Google here.
         * After returning, onAuthStateChange
         * will populate user automatically.
         */
        return {
          success: true,
        };
      } catch (
        error
      ) {
        return {
          success: false,

          error:
            getErrorMessage(
              error
            ),
        };
      }
    };


  /* =========================================
     LOGOUT
  ========================================= */

  const logout =
    async () => {
      try {
        const {
          error,
        } =
          await supabase.auth
            .signOut();


        if (error) {
          console.error(
            "Logout error:",
            error
          );
        }


        setUser(null);
      } catch (
        error
      ) {
        console.error(
          "Logout error:",
          error
        );

        setUser(null);
      }
    };


  /* =========================================
     PROVIDER
  ========================================= */

  return (
    <AuthContext.Provider
      value={{
        user,

        isLoggedIn:
          Boolean(user),

        isAuthLoading,

        login,

        signup,

        loginWithGoogle,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


/* =========================================
   AUTH HOOK
========================================= */

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );


  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }


  return context;
}