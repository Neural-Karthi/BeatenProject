import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { fetchCollections } from "../api/newsContentAPI";
import { useState, useEffect } from "react";

// const collectionsImages = [
//     "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160034/Untitled_design_4_xdxk63.webp",
//     "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160015/Untitled-design.png_wtqxpu.webp",
//     "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160015/Untitled-design.png_wtqxpu.webp",
//     "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160033/Untitled_design_2_ax5pcj.webp",
//     "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160033/Untitled_design_3_rcdkbr.webp",
//     "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160015/Untitled_design_7_nobm8f.webp",
//     "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160033/Untitled_design_1_lv7gwy.webp",
//     "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160015/Untitled_design_5_o88gjf.webp",
//     "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160015/Untitled_design_6_cnuohw.webp",
//     "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160046/Untitled_design_4_1_dk8ki3.webp",
// ];



const Collections = () => {
  const [collectionsImages, setCollectionsImages] = useState([]);
  const DATA_ENTRY_ID = 1;
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const getCollections = async () => {
      try {
        const data = await fetchCollections(DATA_ENTRY_ID);
        console.log(data.collections);
        
        setCollectionsImages(data.collections);
      } catch (err) {
        setCollectionsImages([]);
      }
    };
    getCollections();
  }, []);

  const collections = [
    {
      id: "best-sellers",
      name: "Best Sellars",
      image: collectionsImages[0],
    },
    {
      id: "tshirts",
      name: "Tshirts",
      image: collectionsImages[1],
    },
    {
      id: "shirts",
      name: "Shirts",
      image: collectionsImages[2],
    },
    {
      id: "polo-t-shirts",
      name: "Polo T-shirts",
      image: collectionsImages[3],
    },
    {
      id: "oversized-t-shirts",
      name: "Oversized T-shirts",
      image: collectionsImages[4],
    },
    {
      id: "bottom-wear",
      name: "Bottom Wear",
      image: collectionsImages[5],
    },
    {
      id: "cargo-pants",
      name: "Cargo Pants",
      image: collectionsImages[6],
    },
    {
      id: "jackets",
      name: "Jackets",
      image: collectionsImages[7],
    },
    {
      id: "hoodies",
      name: "Hoodies",
      image: collectionsImages[8],
    },
    {
      id: "co-ord-sets",
      name: "Co-Ord Sets",
      image: collectionsImages[9],
    },
  ];


  // Add a royalty-free human PNG image URL
  const humanPng =
    "https://pngimg.com/uploads/businessman/businessman_PNG6567.png"; // Example PNG with transparency

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 3, md: 8 },
        px: { xs: 2, md: 3 },
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
          Discover our carefully curated collections, each telling its own
          unique story
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {collections.map((collection, index) => (
          <Card
            key={collection.id}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: { xs: "0px", md: "0px" },
              height: { xs: "110px", sm: "130px", md: "150px" },
              borderRadius: "22px",
              p: 0,
              background: "linear-gradient(90deg, #111 60%, #444 100%)",
            }}
          >
            <CardActionArea
              onClick={() => navigate(`/collections/${collection.id}`)}
              sx={{
                height: "100%",
                p: 0,
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* Human PNG overlay, always right */}
              <Box
                component="img"
                src={collection.image}
                alt="Human"
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 0,
                  left: "auto",
                  transform: "translateY(-50%)",
                  height: { xs: 100, sm: 170, md: 200 },
                  zIndex: 3,
                  opacity: 0.92,
                  pointerEvents: "none",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))",
                  userSelect: "none",
                  display: { xs: "block", md: "block" },
                }}
              />
              {/* Collection name, larger and left-aligned */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  color: "#222",
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
                    px: 1,
                    color: "#fff",
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
