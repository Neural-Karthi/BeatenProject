import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Divider,
  Fade,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  ShoppingCart as ShoppingCartIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect fill="%23f5f5f5" width="200" height="200"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="20">Image</text></svg>';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("blob:")) {
    return imagePath;
  }
  if (imagePath && !imagePath.includes("/")) {
    return `${BASE_URL}/Uploads/${imagePath}`;
  }
  return imagePath;
};

// Color mapping for invalid CSS color names
const colorMap = {
  "light blue": "#add8e6",
  "dark green": "#006400",
  "light gray": "#d3d3d3",
  // Add more mappings as needed
};

// Product Image Component
const ProductImage = ({ product, mode, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");

  useEffect(() => {
    const imageUrl = getImageUrl(product.image);
    setCurrentSrc(imageUrl);
    setImageLoaded(false);
    setImageError(false);
  }, [product.image]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    setCurrentSrc(FALLBACK_IMAGE);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        backgroundColor: mode === "dark" ? "#333" : "#f5f5f5",
        minHeight: { xs: 250, md: 300 },
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        sx={{
          height: { xs: 250, md: 300 },
          width: "100%",
          objectFit: "cover",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: imageLoaded ? 1 : 0,
        }}
        image={currentSrc}
        alt={product.name}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {!imageLoaded && !imageError && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: mode === "dark" ? "#333" : "#f5f5f5",
          }}
        >
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
            }}
          />
        </Box>
      )}
    </Box>
  );
};

const Wishlist = ({ mode }) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const matteColors = {
    900: "#1a1a1a",
    800: "#2d2d2d",
    700: "#404040",
    600: "#525252",
    100: "#f5f5f5",
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1); // Pass entire product object
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 0 },
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "#181818",
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          textAlign: "center",
          px: { xs: 2, md: 0 },
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 800,
            fontSize: { xs: "2rem", md: "2.5rem" },
            letterSpacing: "-0.02em",
            color: mode === "dark" ? "#fff" : matteColors[900],
          }}
        >
          My Wishlist
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontSize: { xs: "0.9rem", md: "1rem" },
            maxWidth: "600px",
            mx: "auto",
            color: mode === "dark" ? "#ccc" : matteColors[700],
          }}
        >
          Save your favorite items and keep track of what you love. Add items to
          your cart when you're ready to purchase.
        </Typography>
      </Box>

      {wishlist.length === 0 ? (
        <Fade in={true}>
          <Box
            sx={{
              textAlign: "center",
              py: { xs: 8, md: 12 },
              px: { xs: 2, md: 4 },
              bgcolor: mode === "dark" ? "#222" : "#fff",
              borderRadius: 2,
              boxShadow: mode === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <FavoriteBorderIcon
              sx={{
                fontSize: "3.5rem",
                color: mode === "dark" ? "#ccc" : matteColors[700],
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "1rem", md: "1.2rem" },
                color: mode === "dark" ? "#ccc" : matteColors[700],
                mb: 2,
              }}
            >
              Your wishlist is empty
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                maxWidth: "400px",
                mx: "auto",
                color: mode === "dark" ? "#999" : matteColors[600],
              }}
            >
              Start adding items to your wishlist by clicking the heart icon on
              any product you like.
            </Typography>
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={() => navigate("/products")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: mode === "dark" ? "#fff" : matteColors[900],
                color: mode === "dark" ? matteColors[900] : "#fff",
                py: 1,
                px: 3,
                fontSize: { xs: "0.9rem", md: "1rem" },
                borderRadius: 2,
                "&:hover": {
                  bgcolor: mode === "dark" ? "#ccc" : matteColors[800],
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Browse Products
            </Button>
          </Box>
        </Fade>
      ) : (
        <Grid container spacing={2}>
          {wishlist.map((product, index) => (
            <Grid item xs={12} sm={6} md={3} key={product._id}>
              <Fade
                in={true}
                timeout={500}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    transition: "all 0.3s ease",
                    borderRadius: 2,
                    boxShadow: mode === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: mode === "dark" ? "0 8px 16px rgba(0,0,0,0.4)" : "0 8px 16px rgba(0,0,0,0.15)",
                    },
                    bgcolor: mode === "dark" ? "#232323" : "#fff",
                    color: mode === "dark" ? "#fff" : matteColors[900],
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <ProductImage
                      product={product}
                      mode={mode}
                      onClick={() => handleProductClick(product._id)}
                    />
                    <Tooltip title="Remove from wishlist">
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: mode === "dark" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.9)",
                          color: "#ff1744",
                          "&:hover": {
                            bgcolor: mode === "dark" ? "#fff" : "#eee",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => removeFromWishlist(product._id)}
                      >
                        <FavoriteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: { xs: 2, md: 3 },
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      bgcolor: "inherit",
                      color: "inherit",
                    }}
                  >
                    <Typography
                      gutterBottom
                      variant="subtitle1"
                      component="div"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        cursor: "pointer",
                        "&:hover": {
                          color: mode === "dark" ? "#ccc" : "primary.main",
                        },
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        color: mode === "dark" ? "#fff" : matteColors[900],
                      }}
                      onClick={() => handleProductClick(product._id)}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        color: mode === "dark" ? "#fff" : matteColors[900],
                        mb: 1,
                      }}
                    >
                      {formatPrice(product.price)}
                    </Typography>
                    {product.colors && product.colors.length > 0 && (
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        {product.colors.map((color) => {
                          const colorValue =
                            colorMap[color.toLowerCase()] ||
                            color.toLowerCase().replace(" ", "");
                          return (
                            <Tooltip title={color} key={color}>
                              <Box
                                sx={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  bgcolor: colorValue,
                                  border: `1px solid ${mode === "dark" ? "#666" : "#ccc"}`,
                                  cursor: "pointer",
                                  transition: "transform 0.2s ease",
                                  "&:hover": {
                                    transform: "scale(1.2)",
                                  },
                                }}
                              />
                            </Tooltip>
                          );
                        })}
                      </Box>
                    )}
                    <Tooltip title="Add to cart">
                      <Button
                        variant="contained"
                        size={isMobile ? "medium" : "large"}
                        startIcon={<ShoppingCartIcon />}
                        fullWidth
                        onClick={() => handleAddToCart(product)}
                        sx={{
                          mt: "auto",
                          bgcolor: mode === "dark" ? "#fff" : matteColors[900],
                          color: mode === "dark" ? matteColors[900] : "#fff",
                          py: 1,
                          px: 3,
                          fontSize: { xs: "0.9rem", md: "1rem" },
                          borderRadius: 2,
                          "&:hover": {
                            bgcolor: mode === "dark" ? "#ccc" : matteColors[800],
                            transform: "translateY(-2px)",
                          },
                          "& .MuiButton-startIcon": {
                            marginRight: 0.5,
                          },
                          transition: "all 0.3s ease",
                          fontWeight: 600,
                        }}
                      >
                        Add to Cart
                      </Button>
                    </Tooltip>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Wishlist;