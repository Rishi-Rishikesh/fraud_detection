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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Refresh, Edit, Delete, Add } from '@mui/icons-material';
import axios from '../config/axios';
import TrendLineChart from '../components/charts/TrendLineChart';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import StatsCard from '../components/StatsCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    fraudTransactions: 0,
  });

  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState({
    trends: null,
    fraudDistribution: null,
    categoryDistribution: null,
  });
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, user: null, credits: 0 });
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, chartsRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/users'),
        axios.get('/user/chart-data'), // Reuse user chart data
      ]);

      setStats({
        totalUsers: statsRes.data.total_users,
        totalTransactions: statsRes.data.total_transactions,
        fraudTransactions: statsRes.data.fraud_transactions,
      });
      setUsers(usersRes.data);

      // Process chart data (same as user dashboard)
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
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = async () => {
    await fetchAdminData();
  };

  const handleEditCredits = (user) => {
    setEditDialog({ open: true, user, credits: user.credits });
  };

  const handleSaveCredits = async () => {
    try {
      await axios.put(`/admin/users/${editDialog.user.id}/credits`, {
        credits: editDialog.credits,
      });
      setEditDialog({ open: false, user: null, credits: 0 });
      await fetchAdminData();
    } catch (error) {
      setError('Failed to update credits');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        await fetchAdminData();
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        Admin Dashboard
        <IconButton onClick={handleRefresh} disabled={loading} sx={{ ml: 'auto' }}>
          <Refresh />
        </IconButton>
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Admin Stats Cards */}
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Add color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Total Transactions"
            value={stats.totalTransactions}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Fraud Transactions"
            value={stats.fraudTransactions}
            color="error"
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} lg={8}>
          {chartData.trends && <TrendLineChart data={chartData.trends} title="System-wide Fraud vs Safe Transactions Trend" />}
        </Grid>

        <Grid item xs={12} lg={4}>
          {chartData.fraudDistribution && <PieChart data={chartData.fraudDistribution} title="Overall Distribution" />}
        </Grid>

        <Grid item xs={12}>
          {chartData.categoryDistribution && <BarChart data={chartData.categoryDistribution} title="Fraud by Category" />}
        </Grid>

        {/* User Management */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.credits}</TableCell>
                    <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditCredits(user)} color="primary">
                        <Edit />
                      </IconButton>
                      {!user.is_admin && (
                        <IconButton onClick={() => handleDeleteUser(user.id)} color="error">
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Credits Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null, credits: 0 })}>
        <DialogTitle>Edit User Credits</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Credits"
            type="number"
            fullWidth
            value={editDialog.credits}
            onChange={(e) => setEditDialog({ ...editDialog, credits: parseInt(e.target.value) || 0 })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null, credits: 0 })}>Cancel</Button>
          <Button onClick={handleSaveCredits}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}