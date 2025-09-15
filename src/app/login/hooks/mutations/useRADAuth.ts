import { login } from "@/services/rad.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const radAuthKeys = {
  radToken: ["radToken"] as const,
};

export const useRADLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (userData) => {
      queryClient.setQueryData(
        radAuthKeys.radToken,
        userData.data.tokens.accessToken
      );
    },
    onError: (error) => {
      console.error("Error en login RAD:", error);
    },
  });
};
