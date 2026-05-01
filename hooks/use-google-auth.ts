import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";

import { supabase } from "@/utils/supabase";

WebBrowser.maybeCompleteAuthSession();

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "308567688923-4ofkeldoi6assqq52d9elf3jee90bsa7.apps.googleusercontent.com",
    androidClientId:
      "308567688923-4lvtsdapt8500f7a8m72b7cf9p9is7o6.apps.googleusercontent.com",
    iosClientId:
      "308567688923-fqsjneva17rhip6hitopu0o5p6924dbi.apps.googleusercontent.com",
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      const idToken = response.authentication?.idToken;
      console.log("[auth] idToken 존재:", !!idToken);
      if (accessToken) {
        fetchUserInfo(accessToken, idToken ?? null);
      }
    } else if (response?.type === "error") {
      setError("Google 로그인에 실패했습니다.");
    }
  }, [response]);

  const fetchUserInfo = async (accessToken: string, idToken: string | null) => {
    setLoading(true);
    setError(null);
    try {
      // Google 유저 정보 먼저 가져오기
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        throw new Error("유저 정보를 가져오지 못했습니다.");
      }
      const data = await res.json();
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        picture: data.picture,
      });

      // Supabase 세션 연결 (idToken 있을 때만, 실패해도 로그인은 유지)
      if (idToken) {
        supabase.auth
          .signInWithIdToken({
            provider: "google",
            token: idToken,
            access_token: accessToken,
          })
          .then(({ data, error: supabaseError }) => {
            if (supabaseError) {
              console.warn(
                "[supabase] signInWithIdToken 실패:",
                supabaseError.message,
              );
            } else {
              console.log(
                "[supabase] signInWithIdToken 성공! uid:",
                data.user?.id,
              );
            }
          });
      }
    } catch (e) {
      setError("유저 정보 조회 중 오류가 발생했습니다.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = () => {
    setError(null);
    promptAsync();
  };

  const signOut = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    request,
    signIn,
    signOut,
  };
}
