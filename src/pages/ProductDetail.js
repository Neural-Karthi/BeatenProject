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
  Tooltip,
} from "@mui/material";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocalShippingOutlined as ShippingIcon,
  CheckCircleOutline as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useWishlist } from "../context/WishlistContext";
import { API_ENDPOINTS, buildApiUrl, handleApiError } from "../utils/api";
import axios from "axios";
import { fetchReviewsForProduct, postReview, deleteReview } from "../api/reviewsAPI";

const matteColors = {
  900: "#1a1a1a",
  800: "#2d2d2d",
  700: "#404040",
  600: "#525252",
  100: "#f5f5f5",
};

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect fill="%23f5f5f5" width="200" height="200"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="20">Image</text></svg>';

const getImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("blob:")) {
    return imagePath;
  }
  if (imagePath && !imagePath.includes("/")) {
    return `${buildApiUrl("")}/Uploads/${imagePath}`;
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
  if (pincode.length === 6) {
    const today = new Date();
    const day = today.getDay(); // Sunday = 0, Saturday = 6

    const deliveryDate = new Date(today);
    const addDays = (day === 0 || day === 6) ? 8 : 6;
    deliveryDate.setDate(deliveryDate.getDate() + addDays);

    const formattedDate = deliveryDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(',', '');

    setDeliveryInfo({
      date: formattedDate, // Only the formatted date like "12 Jul 2025"
      cod: "Available",
    });
  } else {
    setDeliveryInfo(null);
  }
};


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
        setSelectedSize(response.data.data?.sizes ? response.data.data.sizes[0] : null);
        setSelectedColor(response.data.data?.colors ? response.data.data.colors[0] : null);
        setLoading(false);
      } catch (error) {
        handleApiError(error);
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
      const data = await fetchReviewsForProduct(productId);
      setReviews(data);
    } catch (error) {
      // Optionally show error
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const isAddToCartDisabled = product?.stock === 0 || !selectedSize || !selectedColor;
  const addToCartTooltip = !selectedSize
    ? "Please select a size"
    : !selectedColor
    ? "Please select a color"
    : product?.stock === 0
    ? "Out of stock"
    : "";

  if (loading) {
    return (
      <Box
        sx={{
          py: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: mode === "dark" ? "#181818" : "#fff",
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              width: 40,
              height: 40,
              border: `3px solid ${mode === "dark" ? "#666" : "#e0e0e0"}`,
              borderTop: `3px solid ${mode === "dark" ? "#ccc" : "#666"}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
              mx: "auto",
            }}
          />
        </Container>
      </Box>
    );
  }
  if (!product) {
    return (
      <Box sx={{ py: 8, textAlign: "center", bgcolor: mode === "dark" ? "#181818" : "#fff" }}>
        <Container maxWidth="lg">
          <Typography variant="h5" sx={{ color: mode === "dark" ? "#fff" : matteColors[900] }}>
            Product not found
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "inherit",
        minHeight: "100vh",
        width: "100%",
        transition: "background 0.3s, color 0.3s",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="xl" disableGutters={isMobile}>
        <Grid container spacing={{ xs: 2, md: 4 }} sx={{ px: { xs: 2, md: 0 } }}>
          {/* Image Gallery (Left) */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                display: { xs: "block", md: "flex" },
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "stretch", md: "flex-start" },
                gap: { xs: 2, md: 3 },
              }}
            >
              {/* Main Image */}
              <Box
                sx={{
                  position: "relative",
                  border: `1px solid ${mode === "dark" ? "#444" : "#eee"}`,
                  borderRadius: { xs: 0, md: 2 },
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: { xs: "100%", md: 600 },
                  height: { xs: 400, md: 600 },
                  background: mode === "dark" ? "#222" : "#fff",
                }}
              >
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
                      background: mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)",
                      color: mode === "dark" ? "#000" : "#fff",
                      transform: "translateY(-50%)",
                      "&:hover": {
                        background: mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.7)",
                      },
                    }}
                  >
                    <ArrowBackIcon />
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
                      transform: "scale(1.05)",
                    },
                  }}
                />
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
                      background: mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)",
                      color: mode === "dark" ? "#000" : "#fff",
                      transform: "translateY(-50%)",
                      "&:hover": {
                        background: mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.7)",
                      },
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                )}
              </Box>
              {/* Thumbnails */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "row", md: "column" },
                  gap: 1.5,
                  flexWrap: { xs: "wrap", md: "nowrap" },
                  maxWidth: { xs: "100%", md: 100 },
                  alignSelf: { xs: "auto", md: "flex-start" },
                  mt: { xs: 2, md: 0 },
                  ml: { xs: 0, md: 2 },
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
                          ? `2px solid ${mode === "dark" ? "#fff" : matteColors[900]}`
                          : "2px solid transparent",
                      borderRadius: 1,
                      overflow: "hidden",
                      transition: "border-color 0.3s ease",
                      width: { xs: 70, md: 80 },
                      height: { xs: 70, md: 80 },
                      flexShrink: 0,
                      background: mode === "dark" ? "#222" : "#fff",
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
                position: { md: "sticky" },
                top: { md: 100 },
                p: { xs: 2, md: 3 },
                bgcolor: mode === "dark" ? "#222" : "#fff",
                borderRadius: 2,
                boxShadow: mode === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: mode === "dark" ? "#fff" : matteColors[900],
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                }}
              >
                {product.name}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 500,
                  mb: 2,
                  color: mode === "dark" ? "#ccc" : matteColors[700],
                }}
              >
                {product.inStock ? (
                  `In Stock: ${product.stockQuantity}`
                ) : (
                  <span style={{ color: mode === "dark" ? "#ff6666" : "red" }}>
                    Out of Stock
                  </span>
                )}
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: mode === "dark" ? "#fff" : matteColors[900],
                }}
              >
                ₹{product.price.toLocaleString()}
              </Typography>

              {/* Color Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    mb: 1,
                    color: mode === "dark" ? "#ccc" : matteColors[700],
                  }}
                >
                  Color: {selectedColor || "Select a color"}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {product.colors.map((color) => (
                    <Chip
                      key={color}
                      label={color}
                      onClick={() => setSelectedColor(color)}
                      variant={selectedColor === color ? "filled" : "outlined"}
                      sx={{
                        cursor: "pointer",
                        minWidth: "60px",
                        borderColor: mode === "dark" ? "#fff" : matteColors[700],
                        backgroundColor:
                          selectedColor === color
                            ? mode === "dark"
                              ? "#fff"
                              : matteColors[900]
                            : "transparent",
                        color:
                          selectedColor === color
                            ? mode === "dark"
                              ? matteColors[900]
                              : "#fff"
                            : mode === "dark"
                            ? "#fff"
                            : matteColors[700],
                        "&:hover": {
                          backgroundColor:
                            selectedColor === color
                              ? mode === "dark"
                                ? "#fff"
                                : matteColors[900]
                              : mode === "dark"
                              ? "#333"
                              : matteColors[100],
                        },
                        fontSize: { xs: "0.85rem", md: "0.9rem" },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Size Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    mb: 1,
                    color: mode === "dark" ? "#ccc" : matteColors[700],
                  }}
                >
                  Size: {selectedSize || "Select a size"}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {product.sizes.map((size) => (
                    <Chip
                      key={size}
                      label={size}
                      onClick={() => setSelectedSize(size)}
                      variant={selectedSize === size ? "filled" : "outlined"}
                      sx={{
                        cursor: "pointer",
                        minWidth: "48px",
                        borderColor: mode === "dark" ? "#fff" : matteColors[700],
                        backgroundColor:
                          selectedSize === size
                            ? mode === "dark"
                              ? "#fff"
                              : matteColors[900]
                            : "transparent",
                        color:
                          selectedSize === size
                            ? mode === "dark"
                              ? matteColors[900]
                              : "#fff"
                            : mode === "dark"
                            ? "#fff"
                            : matteColors[700],
                        "&:hover": {
                          backgroundColor:
                            selectedSize === size
                              ? mode === "dark"
                                ? "#fff"
                                : matteColors[900]
                              : mode === "dark"
                              ? "#333"
                              : matteColors[100],
                        },
                        fontSize: { xs: "0.85rem", md: "0.9rem" },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Quantity & Add to Cart */}
              <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Grid item xs={5} sm={4}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      border: `1px solid ${mode === "dark" ? "#444" : matteColors[600]}`,
                      borderRadius: 1,
                      justifyContent: "space-between",
                      bgcolor: mode === "dark" ? "#333" : "#fff",
                    }}
                  >
                    <IconButton
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      size="small"
                      sx={{
                        color: mode === "dark" ? "#fff" : matteColors[900],
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: mode === "dark" ? "#fff" : matteColors[900],
                      }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      onClick={() => setQuantity((q) => q + 1)}
                      size="small"
                      sx={{
                        color: mode === "dark" ? "#fff" : matteColors[900],
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={7} sm={8}>
                  <Tooltip title={addToCartTooltip} disableHoverListener={!isAddToCartDisabled}>
                    <span>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isAddToCartDisabled}
                        onClick={async () => {
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
                          backgroundColor: mode === "dark" ? "#fff" : matteColors[900],
                          color: mode === "dark" ? matteColors[900] : "#fff",
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: mode === "dark" ? "#ccc" : matteColors[800],
                            transform: "translateY(-2px)",
                          },
                          "&:disabled": {
                            backgroundColor: mode === "dark" ? "#555" : "#ddd",
                            color: "#aaa",
                          },
                          transition: "all 0.3s ease",
                          fontWeight: 600,
                        }}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </span>
                  </Tooltip>
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
                  borderColor: mode === "dark" ? "#fff" : matteColors[900],
                  color: mode === "dark" ? "#fff" : matteColors[900],
                  borderRadius: 1,
                  mb: 3,
                  "&:hover": {
                    backgroundColor: mode === "dark" ? "#333" : matteColors[100],
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                  fontWeight: 600,
                }}
              >
                {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>

              {/* Delivery Pincode Check */}
              <Box
                sx={{
                  border: `1px solid ${mode === "dark" ? "#444" : matteColors[600]}`,
                  borderRadius: 1,
                  p: 2,
                  bgcolor: mode === "dark" ? "#222" : "#fff",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    mb: 1.5,
                    color: mode === "dark" ? "#fff" : matteColors[900],
                  }}
                >
                  Delivery Options
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Enter Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: mode === "dark" ? "#444" : matteColors[600],
                        },
                        "&:hover fieldset": {
                          borderColor: mode === "dark" ? "#fff" : matteColors[900],
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: mode === "dark" ? "#fff" : matteColors[900],
                        },
                        color: mode === "dark" ? "#fff" : matteColors[900],
                      },
                      input: {
                        color: mode === "dark" ? "#fff" : matteColors[900],
                        "::placeholder": {
                          color: mode === "dark" ? "#ccc" : matteColors[700],
                          opacity: 1,
                        },
                      },
                      flex: 1,
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handlePincodeCheck}
                    sx={{
                      backgroundColor: mode === "dark" ? "#fff" : matteColors[900],
                      color: mode === "dark" ? matteColors[900] : "#fff",
                      "&:hover": {
                        backgroundColor: mode === "dark" ? "#ccc" : matteColors[800],
                      },
                      borderRadius: 1,
                      px: 3,
                      fontWeight: 600,
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
                      color: mode === "dark" ? "#4caf50" : "green",
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
                <Accordion defaultExpanded sx={{ bgcolor: mode === "dark" ? "#222" : "#fff" }}>
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon
                        sx={{ color: mode === "dark" ? "#fff" : matteColors[900] }}
                      />
                    }
                    sx={{ bgcolor: mode === "dark" ? "#222" : "#fff" }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: mode === "dark" ? "#fff" : matteColors[900],
                      }}
                    >
                      Product Description
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: mode === "dark" ? "#222" : "#fff" }}>
                    <Typography
                      variant="body2"
                      sx={{ color: mode === "dark" ? "#ccc" : matteColors[700] }}
                    >
                      {product.description}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion sx={{ bgcolor: mode === "dark" ? "#222" : "#fff" }}>
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon
                        sx={{ color: mode === "dark" ? "#fff" : matteColors[900] }}
                      />
                    }
                    sx={{ bgcolor: mode === "dark" ? "#222" : "#fff" }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: mode === "dark" ? "#fff" : matteColors[900],
                      }}
                    >
                      Material & Care
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: mode === "dark" ? "#222" : "#fff" }}>
                    <Typography
                      variant="body2"
                      sx={{ color: mode === "dark" ? "#ccc" : matteColors[700] }}
                    >
                      {product.material}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>

              {cartMessage && (
                <Typography
                  color="success.main"
                  sx={{ mt: 2, textAlign: "center" }}
                >
                  {cartMessage}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Reviews Section (Only if reviews exist or user is authenticated) */}
      {(reviews.length > 0 || isAuthenticated) && (
        <Box
          sx={{
            mt: 6,
            mb: 6,
            px: { xs: 2, md: 0 },
            maxWidth: 800,
            mx: "auto",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 2,
              bgcolor: mode === "dark" ? "#222" : "#fff",
              boxShadow: mode === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: mode === "dark" ? "#fff" : matteColors[900],
              }}
            >
              Customer Reviews
            </Typography>
            {reviews.length === 0 ? (
              <Typography
                color={mode === "dark" ? "#ccc" : matteColors[700]}
                sx={{ textAlign: "center", mb: 3 }}
              >
                No reviews yet.
              </Typography>
            ) : (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                  }}
                >
                  <Rating
                    value={averageRating}
                    precision={0.1}
                    readOnly
                    size={isMobile ? "medium" : "large"}
                    sx={{
                      color: mode === "dark" ? "#FFD700" : matteColors[900],
                      "& .MuiRating-iconEmpty": {
                        color: mode === "dark" ? "#555" : "#ccc",
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      ml: { sm: 1 },
                      fontWeight: 600,
                      color: mode === "dark" ? "#fff" : matteColors[900],
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                    }}
                  >
                    {averageRating.toFixed(1)} / 5
                  </Typography>
                  <Typography
                    sx={{
                      ml: { sm: 2 },
                      color: mode === "dark" ? "#ccc" : matteColors[700],
                      fontSize: { xs: "0.9rem", sm: "1rem" },
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
                      p: { xs: 2, sm: 3 },
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: mode === "dark" ? "#333" : "#fafbfc",
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
                          bgcolor: mode === "dark" ? matteColors[700] : matteColors[600],
                        }}
                      >
                        {review.user?.name ? review.user.name[0] : "?"}
                      </Avatar>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: mode === "dark" ? "#fff" : matteColors[900],
                          fontSize: { xs: "0.95rem", sm: "1rem" },
                        }}
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
                          color: mode === "dark" ? "#ccc" : matteColors[700],
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
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
                            sx={{ ml: { sm: "auto" }, mt: { xs: 1, sm: 0 } }}
                            onClick={() => {
                              setReviewToDelete(review._id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        color: mode === "dark" ? "#ccc" : matteColors[700],
                      }}
                    >
                      {review.comment}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
            {isAuthenticated && (
              <>
                <Divider sx={{ my: 3, bgcolor: mode === "dark" ? "#444" : matteColors[600] }} />
                <Box component="form" onSubmit={handleReviewSubmit} sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      mb: 2,
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: mode === "dark" ? "#fff" : matteColors[900],
                        minWidth: 120,
                      }}
                    >
                      Write a Review
                    </Typography>
                    <Rating
                      value={userRating}
                      onChange={(_, value) => setUserRating(value)}
                      sx={{
                        ml: { sm: 2 },
                        color: mode === "dark" ? "#FFD700" : matteColors[900],
                        "& .MuiRating-iconEmpty": {
                          color: mode === "dark" ? "#555" : "#ccc",
                        },
                      }}
                      size={isMobile ? "medium" : "large"}
                    />
                  </Box>
                  <TextField
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    placeholder="Share your experience..."
                    sx={{
                      mb: 2,
                      bgcolor: mode === "dark" ? "#333" : "#fff",
                      borderRadius: 1,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: mode === "dark" ? "#444" : matteColors[600],
                        },
                        "&:hover fieldset": {
                          borderColor: mode === "dark" ? "#fff" : matteColors[900],
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: mode === "dark" ? "#fff" : matteColors[900],
                        },
                        color: mode === "dark" ? "#fff" : matteColors[900],
                      },
                      input: {
                        color: mode === "dark" ? "#fff" : matteColors[900],
                        "::placeholder": {
                          color: mode === "dark" ? "#ccc" : matteColors[700],
                          opacity: 1,
                        },
                      },
                    }}
                  />
                  {reviewError && (
                    <Typography
                      color="error"
                      sx={{ textAlign: { xs: "center", sm: "left" }, mb: 2 }}
                    >
                      {reviewError}
                    </Typography>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth={isMobile}
                    disabled={!userRating || !userReview.trim()}
                    sx={{
                      py: 1.5,
                      backgroundColor: mode === "dark" ? "#fff" : matteColors[900],
                      color: mode === "dark" ? matteColors[900] : "#fff",
                      borderRadius: 1,
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: mode === "dark" ? "#ccc" : matteColors[800],
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        backgroundColor: mode === "dark" ? "#555" : "#ddd",
                        color: "#aaa",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Submit Review
                  </Button>
                  {reviewSuccess && (
                    <Typography
                      color="success.main"
                      sx={{ mt: 2, textAlign: { xs: "center", sm: "left" } }}
                    >
                      Review submitted!
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Paper>
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            PaperProps={{
              sx: {
                bgcolor: mode === "dark" ? "#222" : "#fff",
                color: mode === "dark" ? "#fff" : matteColors[900],
              },
            }}
          >
            <DialogTitle sx={{ color: mode === "dark" ? "#fff" : matteColors[900] }}>
              Delete Review
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ color: mode === "dark" ? "#ccc" : matteColors[700] }}>
                Are you sure you want to delete this review? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDeleteDialogOpen(false)}
                sx={{ color: mode === "dark" ? "#ccc" : matteColors[900] }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteReview}
                color="error"
                autoFocus
                sx={{ color: mode === "dark" ? "#ff6666" : "error.main" }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
};

export default ProductDetail;