import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Divider,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  Security,
  CreditCard,
} from '@mui/icons-material';
import { BarChart } from './charts/BarChart';
import { PieChart } from './charts/PieChart';
import { TrendLineChart } from './charts/TrendLineChart';

const StatCard = ({ icon, title, value, subtitle, color }) => (
  <Box sx={{ p: 3, height: '100%' }}>
    <Stack direction="row" alignItems="flex-start" spacing={2}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: `${color}.lighter`,
          color: `${color}.main`,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  </Box>
);

export default function TransactionStats({ stats }) {
  const {
    total_transactions,
    fraud_detected,
    total_amount,
    avg_transaction,
    fraud_percentage,
    risk_levels,
    categories,
    merchant_stats,
    daily_volumes,
  } = stats;

  return (
    <Grid container spacing={3}>
      {/* Key Stats */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper elevation={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Total Transactions"
            value={total_transactions.toLocaleString()}
            subtitle={`$${total_amount.toLocaleString()} total volume`}
            color="primary"
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Paper elevation={3}>
          <StatCard
            icon={<Warning />}
            title="Fraud Detected"
            value={fraud_detected}
            subtitle={`${fraud_percentage.toFixed(2)}% of transactions`}
            color="error"
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Paper elevation={3}>
          <StatCard
            icon={<CreditCard />}
            title="Average Transaction"
            value={`$${avg_transaction.toFixed(2)}`}
            color="info"
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Paper elevation={3}>
          <StatCard
            icon={<Security />}
            title="Risk Levels"
            value={
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`${risk_levels.LOW || 0} Low`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`${risk_levels.HIGH || 0} High`}
                  size="small"
                  color="error"
                />
              </Stack>
            }
            color="warning"
          />
        </Paper>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Transaction Volume Trend
          </Typography>
          <Box sx={{ height: 300 }}>
            <TrendLineChart data={daily_volumes} />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Transaction Categories
          </Typography>
          <Box sx={{ height: 300 }}>
            <PieChart data={Object.entries(categories).map(([key, value]) => ({
              label: key,
              value,
            }))} />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top Merchants by Transaction Volume
          </Typography>
          <Box sx={{ height: 400 }}>
            <BarChart
              data={merchant_stats.slice(0, 10).map(stat => ({
                label: stat.merchant,
                value: stat.total_transactions,
                fraudRate: stat.fraud_rate,
              }))}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}