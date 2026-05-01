import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";

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
    // TODO: 아래 값을 Google Cloud Console에서 발급받은 클라이언트 ID로 교체하세요
    clientId:
      "308567688923-4ofkeldoi6assqq52d9elf3jee90bsa7.apps.googleusercontent.com",
    androidClientId:
      "308567688923-4lvtsdapt8500f7a8m72b7cf9p9is7o6.apps.googleusercontent.com",
    iosClientId:
      "308567688923-fqsjneva17rhip6hitopu0o5p6924dbi.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;
      if (token) {
        fetchUserInfo(token);
      }
    } else if (response?.type === "error") {
      setError("Google 로그인에 실패했습니다.");
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
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
