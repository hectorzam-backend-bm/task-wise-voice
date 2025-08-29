import axios from "axios";
import { LoginApiResponse } from "./types/login";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const loginApi = async (tokenId: string): Promise<LoginApiResponse> => {
  try {
    const response = await axios.post<LoginApiResponse>(
      `${API_BASE_URL}/auth/login`,
      { tokenId },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error en loginApi:", error);
    throw error;
  }
};
