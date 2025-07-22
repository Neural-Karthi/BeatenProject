import { axiosInstance } from "../utils/api";
import {
  API_ENDPOINTS,
  buildApiUrl,
  handleApiResponse,
  handleApiError,
} from "../utils/api";

// Use the shared axiosInstance

export const fetchNewsContent = async (id) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.NEWS_CONTENT(id));
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchSlideImages = async (id) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.SLIDE_IMAGES(id));
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchMobileSlideImages = async (id) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MOBIEL_SLIDE_IMAGES(id));
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchAboutUsPage = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.FOOTER_ABOUT_US);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchCollectionImages = async (id) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.COLLECTION_IMAGES(id));
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchMobileCollectionImages = async (id) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MOBILE_COLLECTION_IMAGES(id));
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const fetchCollections = async (id) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.COLLECTIONS(id));
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};