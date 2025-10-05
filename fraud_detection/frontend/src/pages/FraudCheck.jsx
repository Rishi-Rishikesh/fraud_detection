import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const validationSchema = yup.object({
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  merchant: yup
    .string()
    .required('Merchant is required')
    .min(2, 'Merchant name must be at least 2 characters'),
  category: yup
    .string()
    .required('Category is required'),
  hour: yup
    .number()
    .required('Hour is required')
    .min(0, 'Hour must be between 0 and 23')
    .max(23, 'Hour must be between 0 and 23'),
  user_age: yup
    .number()
    .required('Age is required')
    .min(18, 'Age must be at least 18')
    .max(120, 'Age must be realistic'),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters'),
});

const categories = [
  'shopping',
  'entertainment',
  'travel',
  'food',
  'transfer',
  'withdrawal',
  'payment',
];

export default function FraudCheck() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateCredits } = useAuth();

  const formik = useFormik({
    initialValues: {
      amount: '',
      merchant: '',
      category: '',
      hour: new Date().getHours(),
      user_age: '',
      description: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setResult(null);

      try {
        const response = await axios.post('http://localhost:8000/fraud/predict', values);
        setResult(response.data);
        
        // Update credits in auth context if API returns new balance
        if (response.data.credits_remaining !== undefined) {
          updateCredits(response.data.credits_remaining);
        }
      } catch (error) {
        setError(
          error.response?.data?.detail || 
          'Error processing fraud detection request'
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Fraud Detection Check
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="amount"
            name="amount"
            label="Amount"
            type="number"
            value={formik.values.amount}
            onChange={formik.handleChange}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
            margin="normal"
          />

          <TextField
            fullWidth
            id="merchant"
            name="merchant"
            label="Merchant Name"
            value={formik.values.merchant}
            onChange={formik.handleChange}
            error={formik.touched.merchant && Boolean(formik.errors.merchant)}
            helperText={formik.touched.merchant && formik.errors.merchant}
            margin="normal"
          />

          <TextField
            fullWidth
            id="category"
            name="category"
            select
            label="Category"
            value={formik.values.category}
            onChange={formik.handleChange}
            error={formik.touched.category && Boolean(formik.errors.category)}
            helperText={formik.touched.category && formik.errors.category}
            margin="normal"
          >
            {categories.map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            id="hour"
            name="hour"
            label="Hour (0-23)"
            type="number"
            value={formik.values.hour}
            onChange={formik.handleChange}
            error={formik.touched.hour && Boolean(formik.errors.hour)}
            helperText={formik.touched.hour && formik.errors.hour}
            margin="normal"
          />

          <TextField
            fullWidth
            id="user_age"
            name="user_age"
            label="User Age"
            type="number"
            value={formik.values.user_age}
            onChange={formik.handleChange}
            error={formik.touched.user_age && Boolean(formik.errors.user_age)}
            helperText={formik.touched.user_age && formik.errors.user_age}
            margin="normal"
          />

          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description (optional)"
            multiline
            rows={2}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Check Transaction'}
          </Button>
        </Box>

        {result && (
          <Paper elevation={2} sx={{ mt: 4, p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Analysis Result
            </Typography>
            
            <Alert 
              severity={result.prediction.is_fraud ? "error" : "success"}
              sx={{ mb: 2 }}
            >
              {result.prediction.is_fraud ? "⚠️ Fraud Suspected" : "✅ Safe Transaction"}
            </Alert>

            <Typography variant="body1" gutterBottom>
              Fraud Probability: {(result.prediction.fraud_probability * 100).toFixed(1)}%
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              Risk Level: {result.prediction.risk_level.toUpperCase()}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Transaction Details:
            </Typography>
            <Typography variant="body2">
              Amount: ${result.transaction.amount}
            </Typography>
            <Typography variant="body2">
              Merchant: {result.transaction.merchant}
            </Typography>
            <Typography variant="body2">
              Category: {result.transaction.category}
            </Typography>
          </Paper>
        )}
      </Paper>
    </Container>
  );
}