import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const History = ({ user }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Use user.interviewHistory directly if present
        if (user.interviewHistory) {
          setInterviews(user.interviewHistory);
        } else {
          // fallback: fetch from backend
          const response = await axios.post(
            "http://localhost:5000/api/user/login",
            {
              email: user.email,
              name: user.name,
            }
          );
          setInterviews(response.data.interviewHistory || []);
        }
      } catch (error) {
        setInterviews([]);
      }
      setLoading(false);
    };
    fetchInterviews();
  }, [user]);

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Please log in to view your interview history.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/login")}>
            Login
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Interview History
      </Typography>

      {interviews.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography>No interview history found.</Typography>
        </Paper>
      ) : (
        interviews.map((interview, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography>
                  Interview on {new Date(interview.date).toLocaleDateString()} (
                  {interview.techStack}, {interview.level})
                </Typography>
                <Typography color="primary">
                  Score: {interview.totalScore}/10
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {interview.questions.map((q, qIndex) => (
                <Box key={qIndex} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Question {qIndex + 1}:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {q.question}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Your Answer:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {q.answer}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Score: {q.score}/10
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Feedback: {q.feedback}
                  </Typography>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
};

export default History;
