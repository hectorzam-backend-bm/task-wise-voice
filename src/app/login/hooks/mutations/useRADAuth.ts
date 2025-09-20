import { setTokens } from "@/lib/tokens";
import { login } from "@/services/rad.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRADLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (userData) => {
      if (userData.data?.tokens?.accessToken) {
        setTokens({
          accessToken: userData.data.tokens.accessToken,
          refreshToken:
            userData.data.tokens.refreshToken ||
            userData.data.tokens.accessToken,
        });

        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }
    },
    onError: (error) => {
      console.error("Error en login RAD:", error);
    },
  });
};
