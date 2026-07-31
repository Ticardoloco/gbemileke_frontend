import apiClient from "@/api/apiClient";

export type SpecialtySlug =
  | "anti-natal"
  | "post-natal"
  | "stroke-recovery"
  | "bone-setting"
  | "infertility"
  | "labor-and-delivery"
  | "infection-treatment"
  | "male-fertility-care";

export interface SpecialitiesType {
  _id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  approach: string[];
  icon: string;
}

export const getSpecialities = async (): Promise<
  { message: string; specialities: SpecialitiesType[] } | undefined
> => {
  try {
    const response = await apiClient.get<{
      message: string;
      specialities: SpecialitiesType[];
    }>("/api/specialities");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch data", error);
    return undefined;
  }
};

export const getSpecialty = async (slug: string): Promise< {message: string; speciality: SpecialitiesType;} | undefined> =>{
  try {
    const response = await apiClient.get<{message: string; speciality: SpecialitiesType;}>(`/api/specialities/${slug}`);
    return response.data
  } catch (error) {
    console.error("Failed to load data", error);
  }
}
