import { axiosInstance } from "../utils/api";
import {
  API_ENDPOINTS,
  handleApiResponse,
  handleApiError,
} from "../utils/api";

// Use the shared axiosInstance

// Send forgot password OTP
export const sendForgotPasswordOTP = async (email) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD_SEND_OTP, {
      email,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Verify forgot password OTP
export const verifyForgotPasswordOTP = async (email, otp) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD_VERIFY_OTP, {
      email,
      otp,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Reset password
export const resetPassword = async (email, resetToken, newPassword) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD_RESET, {
      email,
      resetToken,
      newPassword,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Send OTP for login (email or phone)
export const sendOtpLogin = async ({ email, phone }) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.SEND_OTP_LOGIN, {
      email,
      phone,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Verify OTP for login (email or phone)
export const verifyOtpLogin = async ({ email, phone, otp }) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.VERIFY_OTP_LOGIN, {
      email,
      phone,
      otp,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
