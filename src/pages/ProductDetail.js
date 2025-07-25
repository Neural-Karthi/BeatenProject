import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  IconButton,
  TextField,
  Avatar,
  Rating,
  Divider,
  Paper,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Star as StarIcon,
  NavigateNext as NavigateNextIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocalShippingOutlined as ShippingIcon,
  CheckCircleOutline as CheckIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useWishlist } from "../context/WishlistContext";
import { API_ENDPOINTS, buildApiUrl, handleApiError } from "../utils/api";
import axios from "axios";

import { getProductById } from "../data/mockData";
import {
  fetchReviewsForProduct,
  postReview,
  deleteReview,
} from "../api/reviewsAPI";

const matteColors = {
  900: "#1a1a1a",
  800: "#2d2d2d",
  700: "#404040",
  600: "#525252",
  100: "#f5f5f5",
};

// Helper function to construct image URL
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect fill="%23f5f5f5" width="200" height="200"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="20">Image</text></svg>';

// Removed BASE_URL as it's now handled by the centralized API

const getImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("blob:")) {
    return imagePath;
  }
  if (imagePath && !imagePath.includes("/")) {
    return `${buildApiUrl("")}/uploads/${imagePath}`;
  }
  return imagePath;
};

const ProductDetail = ({ mode }) => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const images =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];
  const mainImage = getImageUrl(images[mainImageIndex] || "");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes ? product.sizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState(
    product?.colors ? product.colors[0] : null
  );
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(productId);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(productId);
    } else {
      addToWishlist({ ...product, _id: productId });
    }
  };

  const handlePincodeCheck = () => {
    // Dummy delivery info
    if (pincode.length === 6) {
      setDeliveryInfo({
        date: "Thursday, 24 Jul",
        cod: "Available",
      });
    } else {
      setDeliveryInfo(null);
    }
  };

  // Use mock reviews data
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    setLoading(true);
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          buildApiUrl(API_ENDPOINTS.PRODUCT_DETAIL(productId))
        );
        setProduct(response.data.data);
        setLoading(false);
      } catch (error) {
        const apiError = handleApiError(error);
        setProduct(null);
      }
    };
    const fetchReviews = async () => {
      try {
        const data = await fetchReviewsForProduct(productId);
        setReviews(data);
      } catch (error) {
        setReviews([]);
      }
    };
    fetchProduct();
    fetchReviews();
  }, [productId]);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    if (!userRating || !userReview.trim()) return;
    try {
      await postReview({ productId, rating: userRating, comment: userReview });
      setUserRating(0);
      setUserReview("");
      setReviewSuccess(true);
      // Refetch reviews
      const data = await fetchReviewsForProduct(productId);
      setReviews(data);
      setTimeout(() => setReviewSuccess(false), 2000);
    } catch (error) {
      setReviewError("Failed to submit review");
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      await deleteReview(reviewToDelete);
      // Refetch reviews
      const data = await fetchReviewsForProduct(productId);
      setReviews(data);
    } catch (error) {
      // Optionally show error
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Container maxWidth="lg">
          <Typography variant="h5">Loading...</Typography>
        </Container>
      </Box>
    );
  }
  if (!product) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Container maxWidth="lg">
          <Typography variant="h5">Product not found</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
          pt:{md:2},
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "inherit",
        minHeight: "100vh",
        width: "100%",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <Container maxWidth="xl" disableGutters={isMobile}>
        <Grid container spacing={{ xs: 2, md: 6 }}>
          {/* Image Gallery (Left) */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                display: { xs: "block", md: "flex" },
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "stretch", md: "flex-start" },
                gap: { xs: 1, md: 2 },
              }}
            >
              {/* Main Image in its own bordered box */}
              <Box
                sx={{
                  position: "relative",
                  mb: { xs: 2, md: 0 },
                  border: "1px solid #eee",
                  borderRadius: { xs: 0, md: 2 },
                  overflow: "hidden",
                  maxWidth: { xs: "100%", md: "600px" },
                  width: { xs: "100vw", md: "600px" },
                  height: { xs: "auto", md: "600px" },
                  background: "#fff",
                }}
              >
                {/* Left Arrow */}
                {images.length > 1 && (
                  <IconButton
                    onClick={() =>
                      setMainImageIndex(
                        (prev) => (prev - 1 + images.length) % images.length
                      )
                    }
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 8,
                      zIndex: 2,
                      background: "rgba(0,0,0,0.3)",
                      color: "#fff",
                      transform: "translateY(-50%)",
                      display: { xs: "flex", md: "flex" },
                      "&:hover": { background: "rgba(0,0,0,0.5)" },
                    }}
                  >
                    <span style={{ fontSize: 28, fontWeight: 700 }}>
                      &#8592;
                    </span>
                  </IconButton>
                )}
                <Box
                  component="img"
                  src={mainImage}
                  alt={product.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.5s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                />
                {/* Right Arrow */}
                {images.length > 1 && (
                  <IconButton
                    onClick={() =>
                      setMainImageIndex((prev) => (prev + 1) % images.length)
                    }
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: 8,
                      zIndex: 2,
                      background: "rgba(0,0,0,0.3)",
                      color: "#fff",
                      transform: "translateY(-50%)",
                      display: { xs: "flex", md: "flex" },
                      "&:hover": { background: "rgba(0,0,0,0.5)" },
                    }}
                  >
                    <span style={{ fontSize: 28, fontWeight: 700 }}>
                      &#8594;
                    </span>
                  </IconButton>
                )}
              </Box>
              {/* Thumbnails - vertical column, outside main image box */}
              <Box
                sx={{
                    px:{xs:2},
                  display: { xs: "flex", md: "flex" },
                  flexDirection: { xs: "row", md: "column" },
                  gap: 1,
                  flexWrap: { xs: "wrap", md: "nowrap" },
                  width: { xs: "100%", md: "auto" },
                  maxWidth: { xs: "100%", md: "120px" },
                  alignSelf: { xs: "auto", md: "flex-start" },
                  mt: { xs: 1, md: 0 },
                  ml: { xs: 0, md: 2 }, // Add left margin in desktop to separate from main image
                  background: "transparent",
                }}
              >
                {images.map((img, index) => (
                  <Box
                    key={index}
                    onClick={() => setMainImageIndex(index)}
                    sx={{
                      cursor: "pointer",
                      border:
                        mainImageIndex === index
                          ? `2px solid ${matteColors[900]}`
                          : "2px solid transparent",
                      borderRadius: 2,
                      overflow: "hidden",
                      transition: "border-color 0.3s ease",
                      width: { xs: "70px", md: "90px" },
                      height: { xs: "70px", md: "90px" },
                      flexShrink: 0,
                      background: "#fff",
                    }}
                  >
                    <Box
                      component="img"
                      src={getImageUrl(img)}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Product Info (Right) */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                   px:{xs:2},
                position: "sticky",
                top: 100,
                color: mode === "dark" ? "#fff" : "inherit",
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 600, mb: 1.5, letterSpacing: "-0.02em" }}
              >
                {product.name}
              </Typography>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>
                {product.inStock ? (
                  `In Stock: ${product.stockQuantity}`
                ) : (
                  <span style={{ color: "red" }}>Out of Stock</span>
                )}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Rating 
                  value={averageRating} 
                  precision={0.5} 
                  readOnly 
                  sx={mode === "dark" ? {
                    color: "#FFD700", // gold for filled stars
                    '& .MuiRating-iconEmpty': {
                      color: "#555", // dim for empty stars
                    },
                    '& .MuiRating-iconHover': {
                      color: "#FFF700", // lighter gold on hover
                    },
                  } : {}}
                />
                <Typography
                  sx={{ ml: 1, color: mode === "dark" ? "#fff" : "inherit" }}
                >
                  ({reviews.length} reviews)
                </Typography>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: mode === "dark" ? "#fff" : matteColors[800],
                }}
              >
                ₹{product.price.toLocaleString()}
              </Typography>

              {/* Color Selector */}
              <Box sx={{ mb: 3 }}>
  <Typography sx={{ fontWeight: 500, mb: 1 }}>
    Color: {selectedColor}
  </Typography>
  <Box sx={{ display: "flex", gap: 1 }}>
    {product.colors.map((color) => {
      const isSelected = selectedColor === color;
      const isDark = mode === "dark";

      return (
        <Chip
          key={color}
          label={color}
          onClick={() => setSelectedColor(color)}
          variant={isSelected ? "filled" : "outlined"}
          sx={{
            cursor: "pointer",
            borderColor: isDark ? "#fff" : "#181818",
            backgroundColor: isSelected
              ? isDark
                ? "#fff"
                : "#181818"
              : "transparent",
            color: isSelected
              ? isDark
                ? "#181818"
                : "#fff"
              : isDark
              ? "#fff"
              : "#181818",
            "&:hover": {
              backgroundColor: isSelected
                ? isDark
                  ? "#fff"
                  : "#181818"
                : isDark
                ? "#222"
                : "#f5f5f5",
              color: isSelected
                ? isDark
                  ? "#181818"
                  : "#fff"
                : isDark
                ? "#fff"
                : "#181818",
            },
          }}
        />
      );
    })}
  </Box>
</Box>

              {/* Size Selector */}
            <Box sx={{ mb: 3 }}>
  <Typography sx={{ fontWeight: 500, mb: 1 }}>Size</Typography>
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
    {product.sizes.map((size) => {
      const isSelected = selectedSize === size;
      const isDark = mode === "dark";

      return (
        <Chip
          key={size}
          label={size}
          onClick={() => setSelectedSize(size)}
          variant={isSelected ? "filled" : "outlined"}
          sx={{
            cursor: "pointer",
            minWidth: "48px",
            borderColor: isDark ? "#fff" : "#181818",
            backgroundColor: isSelected
              ? isDark
                ? "#fff"
                : "#181818"
              : "transparent",
            color: isSelected
              ? isDark
                ? "#181818"
                : "#fff"
              : isDark
              ? "#fff"
              : "#181818",
            "&:hover": {
              backgroundColor: isSelected
                ? isDark
                  ? "#fff"
                  : "#181818"
                : isDark
                ? "#222"
                : "#f5f5f5",
              color: isSelected
                ? isDark
                  ? "#181818"
                  : "#fff"
                : isDark
                ? "#fff"
                : "#181818",
            },
          }}
        />
      );
    })}
  </Box>
</Box>

              {/* Quantity & Add to Cart */}
              <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Grid item xs={5} sm={4}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      border: `1px solid ${
                        mode === "dark" ? "#fff" : "#696969ff"
                      }`,
                      borderRadius: 2,
                      justifyContent: "space-between",
                    }}
                  >
                    <IconButton
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      size="small"
                      sx={{
                        color: mode === "dark" ? "#fff" : "inherit",
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ fontWeight: 600 }}>{quantity}</Typography>
                    <IconButton
                      onClick={() => setQuantity((q) => q + 1)}
                      size="small"
                      sx={{
                        color: mode === "dark" ? "#fff" : "inherit",
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={7} sm={8}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={
                      product.stock === 0 || !selectedSize || !selectedColor
                    }
                    onClick={async () => {
                      // Always store only the filename in cart
                      let imageFilename = product.image;
                      if (imageFilename && imageFilename.startsWith("http")) {
                        const parts = imageFilename.split("/");
                        imageFilename = parts[parts.length - 1];
                      }
                      const cartProduct = {
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        image: imageFilename,
                        description: product.description,
                        category: product.category,
                        subCategory: product.subCategory,
                        collection: product.collectionName,
                        colors: product.colors,
                        gender: product.gender,
                      };
                      await addToCart(
                        cartProduct,
                        quantity,
                        selectedSize,
                        selectedColor
                      );
                      navigate("/cart");
                    }}
                    sx={{
                      py: 1.5,
                      backgroundColor: mode === "dark" ? "#fff" : "#181818",
                      color: mode === "dark" ? "#181818" : "#fff",
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: mode === "dark" ? "#181818" : "#fff",
                        color: mode === "dark" ? "#fff" : "#181818",
                      },
                      boxShadow: "none",
                    }}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </Grid>
              </Grid>

              {/* Wishlist Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FavoriteBorderIcon />}
                onClick={handleWishlistToggle}
                sx={{
                  py: 1.5,
                  borderColor: mode === "dark" ? "#fff" : "#181818",
                  color: mode === "dark" ? "#fff" : "#181818",
                  borderRadius: 2,
                  mb: 3,
                  background: "none",
                  "&:hover": {
                    background: mode === "dark" ? "#222" : "#f5f5f5",
                  },
                }}
              >
                {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>

              {/* Delivery Pincode Check */}
              <Box
                sx={{
                  border: `1px solid ${mode === "dark" ? "#fff" : "#181818"}`,
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                  Delivery Options
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    color: mode === "dark" ? "#fff" : "inherit",
                    borderColor: mode === "dark" ? "#fff" : "#181818",
                  }}
                >
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Enter Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    InputProps={{
                      style: {
                        color: mode === "dark" ? "#fff" : "#181818",
                        borderColor: mode === "dark" ? "#fff" : "#181818",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: mode === "dark" ? "#fff" : "#181818",
                        },
                        "&:hover fieldset": {
                          borderColor: mode === "dark" ? "#fff" : "#181818",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: mode === "dark" ? "#fff" : "#181818",
                        },
                        color: mode === "dark" ? "#fff" : "#181818",
                      },
                      input: {
                        color: mode === "dark" ? "#fff" : "#181818",
                        "::placeholder": {
                          color: mode === "dark" ? "#fff" : "#181818",
                          opacity: 1,
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handlePincodeCheck}
                    sx={{
                      color: mode === "dark" ? "#181818" : "#fff",
                      //  borderColor: mode === "dark" ? "#fff" : "#181818",
                      backgroundColor: mode === "dark" ? "#fff" : "#181818",
                    }}
                  >
                    Check
                  </Button>
                </Box>
                {deliveryInfo && (
                  <Box
                    sx={{
                      mt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      color: "green",
                    }}
                  >
                    <CheckIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Delivery by {deliveryInfo.date}. COD {deliveryInfo.cod}.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Product Details Accordion */}
              <Box sx={{ mt: 3 }}>
                <Accordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon
                        sx={{ color: mode === "dark" ? "#fff" : "#181818" }}
                      />
                    }
                    sx={{ bgcolor: mode === "dark" ? "#232323" : undefined }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: mode === "dark" ? "#fff" : "#181818",
                      }}
                    >
                      Product Description
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{ bgcolor: mode === "dark" ? "#232323" : undefined }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: mode === "dark" ? "#fff" : "#181818" }}
                    >
                      {product.description}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon
                        sx={{ color: mode === "dark" ? "#fff" : "#181818" }}
                      />
                    }
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#181818",
                        //backgroundColor: mode === "dark" ? "#181818" : "#fff",
                      }}
                    >
                      Material & Care
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      sx={{
                        color: "#181818",
                      }}
                      variant="body2"
                    >
                      {product.material}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>

              {cartMessage && (
                <Typography
                  color="success.main"
                  sx={{ mt: 1, mb: 1, textAlign: "center" }}
                >
                  {cartMessage}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
      {/* Reviews Section */}
      <Box
        sx={{
          mt: 6,
          mb: 6,
          px: { xs: 1, sm: 2, md: 0 },
          maxWidth: 700,
          mx: "auto",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 2,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Customer Reviews
          </Typography>
          {reviews.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", mb: 2 }}
            >
              No reviews yet.
            </Typography>
          ) : (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                }}
              >
                <Rating
                  value={averageRating}
                  precision={0.1}
                  readOnly
                  size={isMobile ? "medium" : "large"}
                />
                <Typography
                  sx={{
                    ml: { sm: 1 },
                    fontWeight: 600,
                    fontSize: { xs: 16, sm: 18 },
                  }}
                >
                  {averageRating.toFixed(1)} / 5
                </Typography>
                <Typography
                  sx={{
                    ml: { sm: 2 },
                    color: "text.secondary",
                    fontSize: { xs: 14, sm: 16 },
                  }}
                >
                  ({reviews.length} reviews)
                </Typography>
              </Box>
              {reviews.map((review) => (
                <Paper
                  key={review._id}
                  elevation={1}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: "#fafbfc",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        mr: { sm: 1 },
                        width: { xs: 36, sm: 44 },
                        height: { xs: 36, sm: 44 },
                        fontSize: { xs: 18, sm: 22 },
                      }}
                    >
                      {review.user?.name ? review.user.name[0] : "?"}
                    </Avatar>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: { xs: 15, sm: 17 } }}
                    >
                      {review.user?.name || "User"}
                    </Typography>
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      sx={{ ml: { sm: 2 } }}
                    />
                    <Typography
                      sx={{
                        ml: { sm: 2 },
                        color: "text.secondary",
                        fontSize: 13,
                      }}
                    >
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                    {isAuthenticated &&
                      user &&
                      review.user &&
                      user._id === review.user._id && (
                        <Button
                          color="error"
                          size="small"
                          sx={{ ml: { sm: 2 }, mt: { xs: 1, sm: 0 } }}
                          onClick={() => {
                            setReviewToDelete(review._id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      )}
                  </Box>
                  <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                    {review.comment}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
          <Divider sx={{ my: 3 }} />
          {/* Review Form (for logged-in users) */}
          {isAuthenticated && (
            <Box component="form" onSubmit={handleReviewSubmit} sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, textAlign: "left", minWidth: 120 }}
                >
                  Write a Review
                </Typography>
                <Rating
                  value={userRating}
                  onChange={(_, value) => setUserRating(value)}
                  sx={{ ml: 2 }}
                  size={isMobile ? "medium" : "large"}
                />
              </Box>
              <TextField
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                multiline
                minRows={2}
                fullWidth
                placeholder="Share your experience..."
                sx={{ mb: 1, bgcolor: "#fff", borderRadius: 2 }}
              />
              {reviewError && (
                <Typography
                  color="error"
                  sx={{ textAlign: { xs: "center", sm: "left" } }}
                >
                  {reviewError}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth={isMobile}
                disabled={!userRating || !userReview.trim()}
                sx={{ mt: 1, py: 1.2, fontWeight: 600 }}
              >
                Submit Review
              </Button>
              {reviewSuccess && (
                <Typography
                  color="success.main"
                  sx={{ mt: 1, textAlign: { xs: "center", sm: "left" } }}
                >
                  Review submitted!
                </Typography>
              )}
            </Box>
          )}
        </Paper>
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Review</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteReview} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ProductDetail;
