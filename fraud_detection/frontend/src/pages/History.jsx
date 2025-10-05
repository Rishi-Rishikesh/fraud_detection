import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Box,
  Grid,
  Pagination,
} from '@mui/material';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { format } from 'date-fns';
import axios from 'axios';

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    merchant: '',
    category: '',
    startDate: null,
    endDate: null,
    fraudStatus: 'all',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [filters, page]);

  const fetchTransactions = async () => {
    try {
      const params = {
        page,
        merchant: filters.merchant,
        category: filters.category,
        fraud_status: filters.fraudStatus !== 'all' ? filters.fraudStatus : undefined,
        start_date: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
        end_date: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
      };

      const response = await axios.get('http://localhost:8000/user/transactions', {
        params,
      });

      setTransactions(response.data.transactions);
      setTotalPages(Math.ceil(response.data.total / response.data.per_page));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Transaction History
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Merchant"
              value={filters.merchant}
              onChange={(e) => setFilters({ ...filters, merchant: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="shopping">Shopping</MenuItem>
              <MenuItem value="entertainment">Entertainment</MenuItem>
              <MenuItem value="travel">Travel</MenuItem>
              <MenuItem value="food">Food</MenuItem>
              <MenuItem value="transfer">Transfer</MenuItem>
              <MenuItem value="withdrawal">Withdrawal</MenuItem>
              <MenuItem value="payment">Payment</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Fraud Status"
              value={filters.fraudStatus}
              onChange={(e) => setFilters({ ...filters, fraudStatus: e.target.value })}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="true">Fraud</MenuItem>
              <MenuItem value="false">Safe</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => setFilters({ ...filters, startDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => setFilters({ ...filters, endDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Merchant</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Probability</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                sx={{
                  bgcolor: tx.is_fraud
                    ? 'error.lighter'
                    : 'background.default',
                }}
              >
                <TableCell>
                  {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>${tx.amount.toFixed(2)}</TableCell>
                <TableCell>{tx.merchant}</TableCell>
                <TableCell>{tx.category}</TableCell>
                <TableCell>
                  <Typography
                    color={tx.is_fraud ? 'error' : 'success'}
                    fontWeight="medium"
                  >
                    {tx.is_fraud ? 'Fraud' : 'Safe'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {(tx.fraud_probability * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Paper>
    </Container>
  );
}