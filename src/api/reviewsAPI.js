import { axiosInstance, API_ENDPOINTS } from "../utils/api";

export const fetchReviewsForProduct = async (productId) => {
  const res = await axiosInstance.get(`/reviews/product/${productId}`);
  return res.data;
};

export const postReview = async ({ productId, rating, comment }) => {
  const res = await axiosInstance.post("/reviews", {
    productId,
    rating,
    comment,
  });
  return res.data;
};

export const deleteReview = async (reviewId) => {
  const res = await axiosInstance.delete(`/reviews/${reviewId}`);
  return res.data;
};

// Optionally add update/delete functions as needed
