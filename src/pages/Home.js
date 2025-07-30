import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Paper,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import {
  heroSlides,
  mobileHeroSlides,
  collectionsData,
  features,
} from "../data/mockData";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS, buildApiUrl, handleApiError } from "../utils/api";

const matteColors = {
  900: "#1a1a1a", // Deepest matte black
  800: "#2d2d2d", // Rich matte black
  700: "#404040", // Medium matte black
  600: "#525252", // Light matte black
  100: "#f5f5f5", // Off-white
};

const Home = ({ mode }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCollection, setCurrentCollection] = useState(0);
  const collectionsRef = React.useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Product data states
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User profile states
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Category-specific product states
  const [bestSellers, setBestSellers] = useState([]);
  const [tShirts, setTShirts] = useState([]);
  const [shirts, setShirts] = useState([]);
  const [oversizedTShirts, setOversizedTShirts] = useState([]);
  const [bottomWear, setBottomWear] = useState([]);
  const [cargoPants, setCargoPants] = useState([]);
  const [jackets, setJackets] = useState([]);
  const [hoodies, setHoodies] = useState([]);
  const [coOrdSets, setCoOrdSets] = useState([]);
  const [shopByCategory, setShopByCategory] = useState([]);

  // Refs for each section
  const sectionRefs = {
    "t-shirts": useRef(null),
    shirts: useRef(null),
    "oversized-t-shirts": useRef(null),
    "bottom-wear": useRef(null),
    "cargo-pants": useRef(null),
    jackets: useRef(null),
    hoodies: useRef(null),
    "co-ord-sets": useRef(null),
  };

  // Use imported hero slides data
  const slides = isMobile ? mobileHeroSlides : heroSlides;

  // Use imported collections data
  const collections = collectionsData;

  // Use imported features data with icons
  const featuresWithIcons = [
    {
      ...features[0],
      icon: <ShippingIcon sx={{ fontSize: 40 }} />,
    },
    {
      ...features[1],
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    },
    {
      ...features[2],
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
    },
    {
      ...features[3],
      icon: <StarIcon sx={{ fontSize: 40 }} />,
    },
  ];

  // Fetch user profile and check subscription status
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setIsSubscribed(false);
        return;
      }

      try {
        setProfileLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setIsSubscribed(false);
          return;
        }

        const response = await axios.get(buildApiUrl(API_ENDPOINTS.PROFILE), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          const profile = response.data.data;
          const subscription = profile.subscription || {
            isSubscribed: false,
            subscriptionCost: 0,
            subscriptionDate: null,
            subscriptionExpiry: null,
            subscriptionType: "",
          };
          setUserProfile({ ...profile, subscription });

          const isCurrentlySubscribed =
            subscription.isSubscribed &&
            subscription.subscriptionExpiry &&
            new Date(subscription.subscriptionExpiry) > new Date();

          setIsSubscribed(isCurrentlySubscribed);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setIsSubscribed(false);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Fetch all products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(buildApiUrl(API_ENDPOINTS.PRODUCTS));

        if (response.data && response.data.data) {
          setAllProducts(response.data.data);
        } else {
          setAllProducts([]);
        }
      } catch (err) {
        const error = handleApiError(err);
        setError(error.message || "Failed to load products");
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Process products into categories when allProducts changes
  useEffect(() => {
    if (allProducts.length > 0) {
      const sortedBySales = [...allProducts].sort(
        (a, b) => (b.soldCount || 0) - (a.soldCount || 0)
      );
      setBestSellers(sortedBySales.slice(0, 5));

      const tShirtsProducts = allProducts.filter(
        (p) => p.category === "T-shirts" && p.subCategory !== "Oversized"
      );
      setTShirts(tShirtsProducts.slice(0, 3));

      const shirtsProducts = allProducts.filter((p) => p.category === "Shirts");
      setShirts(shirtsProducts.slice(0, 3));

      const oversizedTShirtsProducts = allProducts.filter(
        (p) =>
          p.category === "T-shirts" &&
          (p.subCategory === "Oversized" ||
            p.fit === "Oversized" ||
            p.name.toLowerCase().includes("oversized"))
      );
      setOversizedTShirts(oversizedTShirtsProducts.slice(0, 3));

      const bottomWearProducts = allProducts.filter(
        (p) => p.category === "Bottom Wear" && p.subCategory !== "Cargo Pants"
      );
      setBottomWear(bottomWearProducts.slice(0, 3));

      const cargoPantsProducts = allProducts.filter(
        (p) =>
          p.category === "Bottom Wear" &&
          (p.subCategory === "Cargo Pants" ||
            p.name.toLowerCase().includes("cargo"))
      );
      setCargoPants(cargoPantsProducts.slice(0, 3));

      const jacketsProducts = allProducts.filter(
        (p) => p.category === "Jackets"
      );
      setJackets(jacketsProducts.slice(0, 3));

      const hoodiesProducts = allProducts.filter(
        (p) => p.category === "Hoodies"
      );
      setHoodies(hoodiesProducts.slice(0, 3));

      const coOrdSetsProducts = allProducts.filter(
        (p) =>
          p.category === "Co-ord Sets" ||
          p.name.toLowerCase().includes("co-ord")
      );
      setCoOrdSets(coOrdSetsProducts.slice(0, 3));

      const categoryMix = [
        ...tShirtsProducts.slice(0, 1),
        ...shirtsProducts.slice(0, 1),
        ...bottomWearProducts.slice(0, 1),
        ...hoodiesProducts.slice(0, 1),
        ...jacketsProducts.slice(0, 1),
      ];
      setShopByCategory(categoryMix);
    }
  }, [allProducts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered) {
        setCurrentCollection((prev) => {
          const next = (prev + 1) % collections.length;
          handleCollectionScroll(next);
          return next;
        });
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isHovered, collections.length]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const handleCollectionScroll = (index) => {
    if (collectionsRef.current) {
      const cardWidth = 280;
      const gap = 16;
      const scrollPosition = index * (cardWidth + gap);
      collectionsRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentCollection(index);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getButtonPosition = (sectionKey, isMobile) => {
    const positions = {
      "t-shirts": {
        mobile: { left: "20%", top: "85%" },
        desktop: { left: "59%", top: "85%" },
      },
      shirts: {
        mobile: { left: "60%", top: "75%" },
        desktop: { left: "52%", top: "80%" },
      },
      "oversized-t-shirts": {
        mobile: { left: "63%", top: "74%" },
        desktop: { left: "55%", top: "85%" },
      },
      "bottom-wear": {
        mobile: { left: "65%", top: "70%" },
        desktop: { left: "56%", top: "78%" },
      },
      "cargo-pants": {
        mobile: { left: "60%", top: "75%" },
        desktop: { left: "44%", top: "79%" },
      },
      jackets: {
        mobile: { left: "75%", top: "75%" },
        desktop: { left: "47%", top: "80%" },
      },
      hoodies: {
        mobile: { left: "50%", top: "73%" },
        desktop: { left: "50%", top: "80%" },
      },
      "co-ord-sets": {
        mobile: { left: "63%", top: "75%" },
        desktop: { left: "53%", top: "80%" },
      },
    };

    return (
      positions[sectionKey]?.[isMobile ? "mobile" : "desktop"] || {
        left: "50%",
        top: "87%",
      }
    );
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentSlide((prev) => (prev + 1) % slides.length),
    onSwipedRight: () =>
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length),
    trackMouse: true,
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const launchDate = new Date();
    launchDate.setMonth(launchDate.getMonth() + 1);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = launchDate - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "inherit",
        minHeight: "100vh",
        width: "100%",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* Hero Section */}
      <Box
        {...swipeHandlers}
        sx={{
          position: "relative",
          height: { xs: "70vh", sm: "80vh", md: "90vh" },
          minHeight: { xs: 450, md: 600 },
          overflow: "hidden",
          bgcolor: "black",
        }}
      >
        {slides.map((slide, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: currentSlide === index ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: "100%",
              height: "100%",
            }}
          />
        ))}
        {/* Slide Indicators */}
        <Box
          sx={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 1,
            zIndex: 3,
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  currentSlide === index ? "white" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "white",
                },
              }}
            />
          ))}
        </Box>
        {/* Learn More Button (Only on First Slide) */}
        {currentSlide === 0 && (
          <Button
            variant="contained"
            size={isMobile ? "large" : "medium"}
            onClick={() => navigate("/beaten-club")}
            sx={{
              position: "absolute",
              bottom: { xs: 60, sm: 80 },
              left: "50%",
              transform: "translateX(-50%)",
              background:
                mode === "dark"
                  ? "#fff"
                  : "#fff",
              color: mode === "dark" ? "#000" : "#000",
              py: isMobile ? 1.2 : 1,
              px: isMobile ? 3 : 4,
              fontSize: { xs: "0.7rem", md: "0.9rem" },
              borderRadius: 10,
              zIndex: 3,
              "&:hover": {
                background:
                  mode === "dark"
                    ? "#fff"
                    : "#fff",
                transform: "translateY(-2px) translateX(-50%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            LEARN MORE
          </Button>
        )}
        {/* Scroll to Content Arrow */}
        <Box
          onClick={scrollToContent}
          sx={{
            position: "absolute",
            bottom: { xs: 20, sm: 40 },
            left: "50%",
            transform: "translateX(-50%)",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            animation: "bounce 2s infinite",
            "@keyframes bounce": {
              "0%, 20%, 50%, 80%, 100%": {
                transform: "translateY(0) translateX(-50%)",
              },
              "40%": {
                transform: "translateY(-20px) translateX(-50%)",
              },
              "60%": {
                transform: "translateY(-10px) translateX(-50%)",
              },
            },
            zIndex: 3,
          }}
        />
      </Box>

      {/* Shop By Category */}
      {shopByCategory.length > 0 && (
        <Box
          sx={{
            pt: { xs: 4, md: 6 },
            bgcolor: mode === "dark" ? "#181818" : "#fff",
          }}
        >
          <Container maxWidth="xl">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.5rem", md: "2rem" },
                fontWeight: 700,
                textAlign: "center",
                mb: { xs: 2, md: 3 },
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "60px",
                  height: "3px",
                  background: mode === "dark" ? "#fff" : "#000000",
                  borderRadius: "2px",
                },
              }}
            >
              SHOP BY CATEGORY
            </Typography>
            <Box
              sx={{
                display: { xs: "flex", md: "grid" },
                gridTemplateColumns: { md: "repeat(5, 1fr)" },
                gap: { xs: 2, md: 3 },
                overflowX: { xs: "auto", md: "visible" },
                pt: { xs: 3, md: 2 },
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: "center",
                    width: "100%",
                    color: "error.main",
                  }}
                >
                  {error}
                </Typography>
              ) : (
                <>
                  {shopByCategory.slice(0, 5).map((product) => (
                    <Box
                      key={product._id}
                      sx={{
                        flex: { xs: "0 0 50%", sm: "0 0 40%", md: "unset" },
                        minWidth: { xs: "50%", sm: "40%", md: "unset" },
                        maxWidth: { xs: "50%", sm: "40%", md: "unset" },
                        display: "flex",
                      }}
                    >
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: 0,
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          minHeight: { xs: 240, md: 300 },
                          width: "100%",
                          "&:hover": {
                            boxShadow: 4,
                            transform: "translateY(-8px) scale(1.04)",
                          },
                        }}
                        onClick={() => handleProductClick(product._id)}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            pt: "140%",
                            overflow: "hidden",
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={
                              product.image
                                ? product.image.startsWith("http")
                                  ? product.image
                                  : `${buildApiUrl("")}/Uploads/${
                                      product.image
                                    }`
                                : "/images/placeholder.png"
                            }
                            alt={product.name}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                        <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: "1.05rem", md: "1.18rem" },
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{product.price}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                  {shopByCategory.length > 4 && (
                    <Box
                      sx={{
                        flex: { xs: "0 0 50%", md: "unset" },
                        minWidth: { xs: "50%", md: "unset" },
                        maxWidth: { xs: "50%", md: "unset" },
                        display: { xs: "flex", md: "none" },
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Card
                        elevation={1}
                        sx={{
                          width: "100%",
                          minHeight: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: mode === "dark" ? "#181818" : "#fff",
                          color: mode === "dark" ? "#fff" : "#000",
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                          transition: "all 0.3s ease",
                          borderRadius: 0,
                        }}
                        onClick={() =>
                          navigate("/products?sort=shop-by-category")
                        }
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          SEE MORE →
                        </Typography>
                      </Card>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Container>
        </Box>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <Box
          sx={{
            pt: { xs: 2, md: 6 },
            bgcolor: mode === "dark" ? "#181818" : "#fff",
          }}
        >
          <Container maxWidth="xl">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.5rem", md: "2rem" },
                fontWeight: 700,
                textAlign: "center",
                mb: { xs: 5, md: 3 },
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "60px",
                  height: "3px",
                  background: mode === "dark" ? "#fff" : "#000000",
                  borderRadius: "2px",
                },
              }}
            >
              BEST SELLERS
            </Typography>
            <Box
              sx={{
                display: { xs: "flex", md: "grid" },
                gridTemplateColumns: { md: "repeat(5, 1fr)" },
                gap: { xs: 2, md: 3 },
                overflowX: { xs: "auto", md: "visible" },
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: "center",
                    width: "100%",
                    color: "error.main",
                  }}
                >
                  {error}
                </Typography>
              ) : (
                <>
                  {bestSellers.slice(0, 5).map((product) => (
                    <Box
                      key={product._id}
                      sx={{
                        flex: { xs: "0 0 50%", md: "unset" },
                        minWidth: { xs: "50%", md: "unset" },
                        maxWidth: { xs: "50%", md: "unset" },
                        p: 0,
                        display: "flex",
                      }}
                    >
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: 0,
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          minHeight: { xs: 240, md: 300 },
                          width: "100%",
                          "&:hover": {
                            boxShadow: 4,
                            transform: "translateY(-8px) scale(1.04)",
                          },
                        }}
                        onClick={() => handleProductClick(product._id)}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            pt: "140%",
                            overflow: "hidden",
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={
                              product.image
                                ? product.image.startsWith("http")
                                  ? product.image
                                  : `${buildApiUrl("")}/Uploads/${
                                      product.image
                                    }`
                                : "/images/placeholder.png"
                            }
                            alt={product.name}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                        <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: "1.05rem", md: "1.18rem" },
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{product.price}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                  {bestSellers.length > 4 && (
                    <Box
                      sx={{
                        flex: { xs: "0 0 50%", md: "unset" },
                        minWidth: { xs: "50%", md: "unset" },
                        maxWidth: { xs: "50%", md: "unset" },
                        display: { xs: "flex", md: "none" },
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Card
                        elevation={1}
                        sx={{
                          width: "100%",
                          minHeight: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: mode === "dark" ? "#181818" : "#fff",
                          color: mode === "dark" ? "#fff" : "#000",
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                          transition: "all 0.3s ease",
                          borderRadius: 0,
                        }}
                        onClick={() => navigate("/products?sort=best-sellers")}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          SEE MORE →
                        </Typography>
                      </Card>
                    </Box>
                  )}
                </>
              )}
            </Box>
            {bestSellers.length > 5 && (
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    py: 1,
                    px: 4,
                    fontSize: "0.9rem",
                    borderRadius: 10,
                    backgroundColor: mode === "dark" ? "#181818" : "#fff",
                    color: mode === "dark" ? "#fff" : "#000",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => navigate("/products?sort=best-sellers")}
                >
                  SEE MORE
                </Button>
              </Box>
            )}
          </Container>
        </Box>
      )}

      {/* Sectioned Collections */}
      {[
        {
          name: "T-SHIRTS",
          key: "t-shirts",
          image: "/images/category1Desktip.png",
          products: tShirts,
        },
        {
          name: "SHIRTS",
          key: "shirts",
          image: "/images/shirts.png",
          products: shirts,
        },
        {
          name: "OVERSIZED T-SHIRTS",
          key: "oversized-t-shirts",
          image: "/images/oversized-tshirts.png",
          products: oversizedTShirts,
        },
        {
          name: "BOTTOM WEAR",
          key: "bottom-wear",
          image: "/images/bottom-wear.png",
          products: bottomWear,
        },
        {
          name: "CARGO PANTS",
          key: "cargo-pants",
          image: "/images/cargo-pants.png",
          products: cargoPants,
        },
        {
          name: "JACKETS",
          key: "jackets",
          image: "/images/jackets.png",
          products: jackets,
        },
        {
          name: "HOODIES",
          key: "hoodies",
          image: "/images/hoodies.png",
          products: hoodies,
        },
        {
          name: "CO-ORD SETS",
          key: "co-ord-sets",
          image: "/images/co-ord-sets.png",
          products: coOrdSets,
        },
      ].map(
        (section, idx) =>
          section.products.length > 0 && (
            <Box
              key={section.key}
              ref={sectionRefs[section.key]}
              sx={{
                bgcolor: mode === "dark" ? "#181818" : "#fff",
              }}
            >
              <Container maxWidth="xl">
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "1.5rem", md: "2rem" },
                    fontWeight: 700,
                    textAlign: "center",
                    py: { xs: 3, md: 2 },
                    position: "relative",
                    letterSpacing: "-0.02em",
                    color: mode === "dark" ? "#fff" : "#181818",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60px",
                      height: "3px",
                      background: mode === "dark" ? "#fff" : "#000000",
                      borderRadius: "2px",
                    },
                  }}
                >
                  {section.name}
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: {
                        xs: "120px",
                        md: "100%",
                      },
                      width: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={isMobile ? `/images/${idx + 1}.png` : section.image}
                      alt={section.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "top",
                        display: "block",
                        borderRadius: isMobile ? "8px" : "10px",
                      }}
                      onClick={() =>
                        navigate(
                          `/products?category=${encodeURIComponent(
                            section.key
                          )}`
                        )
                      }
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    mt: 1.5,
                    display: { xs: "flex", md: "grid" },
                    gridTemplateColumns: { md: "repeat(5, 1fr)" },
                    gap: { xs: 0.5, md: 3 },
                    overflowX: { xs: "auto", md: "visible" },
                    "&::-webkit-scrollbar": { display: "none" },
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    section.products.slice(0, 5).map((product, index) => (
                      <Box
                        key={product._id || index}
                        sx={{
                          flex: { xs: "0 0 50%", md: "unset" },
                          minWidth: { xs: "50%", md: "unset" },
                          maxWidth: { xs: "50%", md: "unset" },
                          display: "flex",
                        }}
                      >
                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: 0,
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            minHeight: { xs: 240, md: 300 },
                            width: "100%",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "translateY(-8px) scale(1.04)",
                            },
                          }}
                          onClick={() => handleProductClick(product._id)}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              pt: "160%",
                              overflow: "hidden",
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={product.image}
                              alt={product.name}
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.3s ease-in-out",
                              }}
                            />
                          </Box>
                          <CardContent sx={{ textAlign: "center", p: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600 }}
                            >
                              {product.name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 0.7,
                                my: 1,
                              }}
                            >
                              {product.colors &&
                                product.colors.slice(0, 3).map((color, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: "50%",
                                      background: color,
                                      border: "1.5px solid #eee",
                                      boxShadow: "0 1px 2px rgba(0,0,0,0.07)",
                                    }}
                                  />
                                ))}
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: {
                                  xs: "0.82rem",
                                  sm: "0.92rem",
                                  md: "1rem",
                                },
                              }}
                            >
                              ₹{product.price}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    ))
                  )}
                  {section.products.length > 5 && (
                    <Box
                      sx={{
                        flex: { xs: "0 0 50%", md: "unset" },
                        minWidth: { xs: "50%", md: "unset" },
                        maxWidth: { xs: "50%", md: "unset" },
                        display: { xs: "flex", md: "none" },
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Card
                        elevation={1}
                        sx={{
                          width: "100%",
                          minHeight: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: mode === "dark" ? "#181818" : "#fff",
                          color: mode === "dark" ? "#fff" : "#000",
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                          transition: "all 0.3s ease",
                          borderRadius: 0,
                        }}
                        onClick={() =>
                          navigate(
                            `/products?category=${encodeURIComponent(
                              section.key
                            )}`
                          )
                        }
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          SEE MORE →
                        </Typography>
                      </Card>
                    </Box>
                  )}
                </Box>
              </Container>
            </Box>
          )
      )}

      {/* Features Section */}
      <Box
        sx={{
          pt: { xs: 3, md: 2 },
          mt: { xs: 3, md: 2 },
          bgcolor: mode === "dark" ? "#181818" : "#fff",
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={2}>
            {featuresWithIcons.map((feature, index) => (
              <Grid item xs={6} md= {3} key={index}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: { xs: 1.5, md: 2 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box sx={{ color: mode === "dark" ? "#fff" : "black" }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      fontSize: { xs: "0.95rem", md: "1.1rem" },
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: mode === "dark" ? "#fff" : "black",
                      maxWidth: "250px",
                      fontSize: { xs: "0.8rem", md: "1rem" },
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Premium Membership Banner */}
      {!profileLoading && !isSubscribed && (
        <Box
          sx={{
            pt: { xs: 2, md: 3 },
            pb: { xs: 2, md: 2 },
            mb: 0,
            bgcolor: mode === "dark" ? "#181818" : "#f7f7f7",
          }}
        >
          <Container maxWidth="xl">
            <Paper
              sx={{
                p: { xs: 2, md: 6 },
                background:
                  mode === "dark"
                    ? "linear-gradient(45deg, #181818 30%, #232323 90%)"
                    : "linear-gradient(45deg, #000000 30%, #1a1a1a 90%)",
                color: "white",
                mb: { xs: 0, md: 6 },
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)",
                  pointerEvents: "none",
                },
              }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      bgcolor: "transparent",
                      color: "white",
                      borderRadius: 2,
                      p: { xs: 2, md: 3 },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        mb: 1.2,
                        letterSpacing: "-0.02em",
                        background:
                          "linear-gradient(90deg, #C9A14A 0%, #FFD700 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontSize: { xs: "1.1rem", md: "2rem" },
                      }}
                    >
                      Join BEATEN CLUB
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        opacity: 0.85,
                        mb: 2,
                        color: "white",
                        fontWeight: 400,
                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                      }}
                    >
                      Unlock exclusive streetwear experiences, rewards, and VIP
                      treatment as a BEATEN CLUB member.
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        size={isMobile ? "large" : "medium"}
                        sx={{
                          background:
                            "linear-gradient(90deg, #FFD700 0%, #C9A14A 100%)",
                          color: "black",
                          pt: isMobile ? 1.2 : 1,
                          px: isMobile ? 3 : 4,
                          fontSize: { xs: "0.7rem", md: "0.9rem" },
                          borderRadius: 10,
                          width: "auto",
                          minWidth: 0,
                          "&:hover": {
                            background:
                              "linear-gradient(90deg, #C9A14A 0%, #FFD700 100%)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                          transition: "all 0.3s ease",
                          alignSelf: "center",
                          whiteSpace: "nowrap",
                        }}
                        onClick={() => navigate("/premium")}
                      >
                        JOIN NOW
                      </Button>
                      <Button
                        variant="outlined"
                        size={isMobile ? "large" : "medium"}
                        onClick={() => navigate("/premium")}
                        sx={{
                          borderColor: matteColors[900],
                          color: matteColors[900],
                          backgroundColor: "white",
                          py: isMobile ? 1.2 : 1,
                          px: isMobile ? 3 : 4,
                          fontSize: { xs: "0.7rem", md: "0.9rem" },
                          borderRadius: 10,
                          width: "auto",
                          minWidth: 0,
                          "&:hover": {
                            backgroundColor: matteColors[100],
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                          transition: "all 0.3s ease",
                          alignSelf: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        LEARN MORE
                      </Button>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      bgcolor: "#181818",
                      color: "white",
                      borderRadius: 2,
                      p: { xs: 2, md: 3 },
                      boxShadow: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <Grid container spacing={1.2} sx={{ width: "100%" }}>
                      {[
                        "Early Access to new drops",
                        "Exclusive Member Discounts",
                        "Free Express Shipping",
                        "VIP Customer Support",
                        "Special Birthday Rewards",
                      ].map((point, idx) => (
                        <Grid item xs={12} sm={6} key={idx}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1.5,
                              color: "white",
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{ marginRight: 8 }}
                            >
                              <defs>
                                <linearGradient
                                  id={`gold-gradient-${idx}`}
                                  x1="0"
                                  y1="0"
                                  x2="1"
                                  y2="1"
                                >
                                  <stop offset="0%" stopColor="#C9A14A" />
                                  <stop offset="100%" stopColor="#FFD700" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M9 16.2l-3.5-3.5 1.41-1.41L9 13.38l7.09-7.09 1.41 1.41z"
                                fill={`url(#gold-gradient-${idx})`}
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="11"
                                stroke={`url(#gold-gradient-${idx})`}
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                            <span
                              style={{
                                fontWeight: 500,
                                color: "white",
                                fontSize: {
                                  xs: "0.65rem",
                                  sm: "0.75rem",
                                  md: "0.85rem",
                                },
                              }}
                            >
                              {point}
                            </span>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backdropFilter: "blur(8px)",
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  textAlign: "center",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: "#181818",
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: "2.5rem", md: "3rem" },
                  }}
                >
                  Launching Soon
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#181818",
                    fontWeight: 500,
                    fontSize: { xs: "1.5rem", md: "2rem" },
                  }}
                >
                  {`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
                </Typography>
              </Box>
            </Paper>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default Home;