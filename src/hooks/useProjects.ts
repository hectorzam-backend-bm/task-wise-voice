import { getAccessToken } from "@/lib/tokens";
import { fetchProjects } from "@/services/rad.service";
import { useQuery } from "@tanstack/react-query";

export const useProjects = () => {
  const accessToken = getAccessToken();

  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};
