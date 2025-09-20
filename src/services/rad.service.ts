import { axiosAuth, axiosPublic } from "../lib/axios";
import { LoginApiResponse } from "./interfaces/login";
import { FindProjectsApiResponse } from "./interfaces/projects";

export const login = async (tokenId: string): Promise<LoginApiResponse> => {
  try {
    const response = await axiosPublic.post<LoginApiResponse>(
      "/auth/login",
      { tokenId },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error en login rad:", error);
    throw error;
  }
};

export const fetchProjects = async () => {
  try {
    const response = await axiosAuth.get<FindProjectsApiResponse>("/projects");
    return response.data.data.sort((a, b) =>
      a.client.name.localeCompare(b.client.name)
    );
  } catch (error: any) {
    console.error("Error fetching projects from RAD:", error);

    throw error;
  }
};
