import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { Receipt, Warning, CreditCard, Refresh } from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from '../config/axios';
import TrendLineChart from '../components/charts/TrendLineChart';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import StatsCard from '../components/StatsCard';
import TransactionsTable from '../components/TransactionsTable';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    fraudulentTransactions: 0,
    remainingCredits: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [chartData, setChartData] = useState({
    trends: null,
    fraudDistribution: null,
    categoryDistribution: null,
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be separate API endpoints
      const [statsRes, transactionsRes, chartsRes] = await Promise.all([
        axios.get('/user/stats'),
        axios.get('/user/recent-transactions'),
        axios.get('/user/chart-data'),
      ]);

      setStats(statsRes.data);
      setRecentTransactions(transactionsRes.data);

      // Process chart data
      const trends = {
        labels: chartsRes.data.dates,
        datasets: [
          {
            label: 'Fraud Transactions',
            data: chartsRes.data.fraudCounts,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Safe Transactions',
            data: chartsRes.data.safeCounts,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
        ],
      };

      const fraudDistribution = {
        labels: ['Fraud', 'Safe'],
        datasets: [
          {
            data: [
              chartsRes.data.fraudTotal,
              chartsRes.data.safeTotal,
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(75, 192, 192, 0.5)',
            ],
          },
        ],
      };

      const categoryDistribution = {
        labels: Object.keys(chartsRes.data.categoryFraud),
        datasets: [
          {
            label: 'Fraud by Category',
            data: Object.values(chartsRes.data.categoryFraud),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      };

      setChartData({
        trends,
        fraudDistribution,
        categoryDistribution,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        Fraud Detection Dashboard
        <IconButton onClick={handleRefresh} disabled={loading} sx={{ ml: 'auto' }}>
          <Refresh />
        </IconButton>
      </Typography>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Total Transactions"
            value={stats.totalTransactions}
            icon={<Receipt color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Fraudulent Transactions"
            value={stats.fraudulentTransactions}
            color="error"
            icon={<Warning color="error" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Remaining Credits"
            value={stats.remainingCredits}
            color="primary"
            icon={<CreditCard color="primary" />}
          />
        </Grid>

      {/* Charts */}
      <Grid item xs={12} lg={8}>
        {chartData.trends && <TrendLineChart data={chartData.trends} title="Fraud vs Safe Transactions Trend" />}
      </Grid>

      <Grid item xs={12} lg={4}>
        {chartData.fraudDistribution && <PieChart data={chartData.fraudDistribution} title="Overall Distribution" />}
      </Grid>

      <Grid item xs={12}>
        {chartData.categoryDistribution && <BarChart data={chartData.categoryDistribution} title="Fraud by Category" />}
      </Grid>

      {/* Recent Transactions Table */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Probability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>${tx.amount.toFixed(2)}</TableCell>
                  <TableCell>{tx.merchant}</TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell>
                    {tx.is_fraud ? (
                      <Typography color="error">Fraud</Typography>
                    ) : (
                      <Typography color="success">Safe</Typography>
                    )}
                  </TableCell>
                  <TableCell>{(tx.fraud_probability * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
    </>
  );
}