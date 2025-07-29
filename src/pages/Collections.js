import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardActionArea,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { fetchCollections } from "../api/newsContentAPI";

const Collections = ({ mode }) => {
  const [collectionsImages, setCollectionsImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const DATA_ENTRY_ID = 1;
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const getCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCollections(DATA_ENTRY_ID);
        console.log("Fetched collections:", data.collections);
        setCollectionsImages(data.collections || []);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setError("Failed to load collections");
        setCollectionsImages([]);
      } finally {
        setLoading(false);
      }
    };
    getCollections();
  }, []);

  const collections = [
    {
      id: "best-sellers",
      name: "Best Sellers",
      image: collectionsImages[0] || "/images/placeholder.png",
    },
    {
      id: "t-shirts",
      name: "T-Shirts",
      image: collectionsImages[1] || "/images/placeholder.png",
    },
    {
      id: "shirts",
      name: "Shirts",
      image: collectionsImages[2] || "/images/placeholder.png",
    },
    {
      id: "oversized-t-shirts",
      name: "Oversized T-Shirts",
      image: collectionsImages[3] || "/images/placeholder.png",
    },
    {
      id: "bottom-wear",
      name: "Bottom Wear",
      image: collectionsImages[4] || "/images/placeholder.png",
    },
    {
      id: "cargo-pants",
      name: "Cargo Pants",
      image: collectionsImages[5] || "/images/placeholder.png",
    },
    {
      id: "jackets",
      name: "Jackets",
      image: collectionsImages[6] || "/images/placeholder.png",
    },
    {
      id: "hoodies",
      name: "Hoodies",
      image: collectionsImages[7] || "/images/placeholder.png",
    },
    {
      id: "co-ord-sets",
      name: "Co-Ord Sets",
      image: collectionsImages[8] || "/images/placeholder.png",
    },
  ];

  const handleCollectionClick = (id) => {
    console.log("Navigating to:", id === "best-sellers" ? `/products?sort=best-sellers` : `/products?category=${encodeURIComponent(id)}`);
    if (id === "best-sellers") {
      navigate("/products?sort=best-sellers");
    } else {
      navigate(`/products?category=${encodeURIComponent(id)}`);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: "center", bgcolor: theme.palette.background.default }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8, textAlign: "center", bgcolor: theme.palette.background.default }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 3, md: 8 },
        px: { xs: 2, md: 3 },
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Hero Section */}
      <Box sx={{ mb: { xs: 4, md: 8 } }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
            fontWeight: 700,
            textAlign: "center",
            mb: { xs: 1.5, md: 2 },
            letterSpacing: { xs: "-0.02em", md: "-0.03em" },
            color: theme.palette.text.primary,
          }}
        >
          Our Collections
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            textAlign: "center",
            maxWidth: "800px",
            mx: "auto",
            mb: { xs: 3, md: 4 },
            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            px: { xs: 2, md: 0 },
          }}
        >
          Discover our carefully curated collections, each telling its own unique story
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {collections.map((collection) => (
          <Card
            key={collection.id}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: { xs: "12px", md: "22px" },
              height: { xs: "110px", sm: "130px", md: "150px" },
              background:
                mode === "dark"
                  ? "linear-gradient(90deg, #1a1a1a 60%, #333 100%)"
                  : "linear-gradient(90deg, #e0e0e0 60%, #bbb 100%)",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
          >
            <CardActionArea
              onClick={() => handleCollectionClick(collection.id)}
              sx={{
                height: "100%",
                p: 0,
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* Collection Image */}
              <CardMedia
                component="img"
                src={collection.image}
                alt={collection.name}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 0,
                  transform: "translateY(-50%)",
                  height: { xs: "100%", sm: "120%", md: "140%" },
                  width: "auto",
                  zIndex: 3,
                  opacity: 0.92,
                  pointerEvents: "none",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))",
                }}
              />
              {/* Collection Name */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  zIndex: 4,
                  textAlign: "left",
                  p: 0,
                  pl: { xs: 2, sm: 4, md: 6 },
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    textShadow: "0 2px 8px rgba(0,0,0,0.45)",
                    fontSize: { xs: "1.35rem", sm: "1.7rem", md: "2.1rem" },
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                    color: mode === "dark" ? "#fff" : "#222",
                    textAlign: "left",
                    maxWidth: { xs: "60%", sm: "60%", md: "60%" },
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {collection.name}
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default Collections;