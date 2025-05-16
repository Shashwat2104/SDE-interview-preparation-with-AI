import { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;
        const response = await axios.get(
          "http://localhost:5000/api/user/analytics",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAnalytics(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch analytics");
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
        <div className="text-white text-2xl">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-gray-900">
        <div className="text-red-500 text-2xl">{error}</div>
      </div>
    );
  }

  const performanceData = {
    labels: analytics.recentInterviews.map((interview) =>
      new Date(interview.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Score",
        data: analytics.recentInterviews.map((interview) => interview.score),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const techStackData = {
    labels: Object.keys(analytics.techStackPerformance),
    datasets: [
      {
        label: "Average Score",
        data: Object.values(analytics.techStackPerformance),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
      },
    ],
  };

  const difficultyData = {
    labels: Object.keys(analytics.difficultyPerformance),
    datasets: [
      {
        label: "Average Score",
        data: Object.values(analytics.difficultyPerformance),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
      },
    ],
  };

  const strengthsWeaknessesData = {
    labels: [
      "Problem Solving",
      "Code Quality",
      "Time Management",
      "Communication",
      "Technical Knowledge",
    ],
    datasets: [
      {
        label: "Performance",
        data: [
          analytics.strengthsWeaknesses.problemSolving,
          analytics.strengthsWeaknesses.codeQuality,
          analytics.strengthsWeaknesses.timeManagement,
          analytics.strengthsWeaknesses.communication,
          analytics.strengthsWeaknesses.technicalKnowledge,
        ],
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgb(59, 130, 246)",
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(59, 130, 246)",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Your Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Overall Performance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 p-4 rounded-lg">
                <p className="text-gray-300">Total Interviews</p>
                <p className="text-3xl font-bold text-white">
                  {analytics.totalInterviews}
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <p className="text-gray-300">Average Score</p>
                <p className="text-3xl font-bold text-white">
                  {analytics.averageScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Recent Performance
            </h2>
            <Line
              data={performanceData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                    labels: { color: "white" },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    ticks: { color: "white" },
                  },
                  x: {
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    ticks: { color: "white" },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Tech Stack Performance
            </h2>
            <Bar
              data={techStackData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                    labels: { color: "white" },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    ticks: { color: "white" },
                  },
                  x: {
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    ticks: { color: "white" },
                  },
                },
              }}
            />
          </div>

          <div className="bg-white/10 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Difficulty Performance
            </h2>
            <Bar
              data={difficultyData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                    labels: { color: "white" },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    ticks: { color: "white" },
                  },
                  x: {
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    ticks: { color: "white" },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-xl">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Strengths & Weaknesses
          </h2>
          <Radar
            data={strengthsWeaknessesData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: { color: "white" },
                },
              },
              scales: {
                r: {
                  angleLines: { color: "rgba(255, 255, 255, 0.1)" },
                  grid: { color: "rgba(255, 255, 255, 0.1)" },
                  pointLabels: { color: "white" },
                  ticks: { color: "white" },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
