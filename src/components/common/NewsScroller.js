import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Marquee from "react-fast-marquee";
import { fetchNewsContent } from "../../api/newsContentAPI";

const DATA_ENTRY_ID = "68764ef87d492357106bb01d"; // TODO: Replace with actual ID or prop

const NewsScroller = () => {
  const [newsContent, setNewsContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNewsContent(DATA_ENTRY_ID);
        setNewsContent(data.newsContent || "");
      } catch (err) {
        setError(err.message || "Failed to load news");
      } finally {
        setLoading(false);
      }
    };
    getNews();
  }, []);

  return (
    <Box
      sx={{
        background: "#E8E8E8",
        color: "#fff",
        p: 4,
        color: "black",
        py: 0.8,
        overflow: "hidden",
        whiteSpace: "nowrap",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {loading ? (
        <Typography variant="body2">Loading news...</Typography>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      ) : (
        <Marquee
          gradient={false}
          speed={40}
          play={true}
          pauseOnHover={false}
          direction="left"
        >
          <Typography
            variant="body2"
            sx={{
              mx: 2,
              display: "inline-block",
              fontWeight: 400,
              letterSpacing: "0.2em",
              fontFamily: [
                "Roboto",
                "-apple-system",
                "BlinkMacSystemFont",
                '"Segoe UI"',
                "Arial",
                "sans-serif",
              ].join(","),
              fontSize: { xs: "0.875rem", md: "0.8rem" },
            }}
          >
            {newsContent}
          </Typography>
        </Marquee>
      )}
    </Box>
  );
};

export default NewsScroller;
