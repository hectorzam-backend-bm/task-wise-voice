import axios from "axios";
import { LoginApiResponse } from "./interfaces/login";
import { FindProjectsApiResponse } from "./interfaces/projects";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const login = async (tokenId: string): Promise<LoginApiResponse> => {
  try {
    const response = await axios.post<LoginApiResponse>(
      `${API_BASE_URL}/auth/login`,
      { tokenId },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error en login rad:", error);
    throw error;
  }
};

export const fetchProjects = async (accessToken: string) => {
  try {
    const response = await axios.get<FindProjectsApiResponse>(
      `${API_BASE_URL}/projects`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.data.sort((a, b) =>
      a.client.name.localeCompare(b.client.name)
    );
  } catch (error) {
    console.error("Error fetching projects from RAD:", error);
    throw error;
  }
};
