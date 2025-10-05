import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import toast from 'react-hot-toast';
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
  Grid,
  Card,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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

const getRiskColor = (level) => {
  switch (level?.toLowerCase()) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

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
        const response = await axios.post('/fraud/predict', values);
        setResult(response.data);

        if (response.data.credits_remaining !== undefined) {
          updateCredits(response.data.credits_remaining);
        }

        // Show success toast
        const isFraud = response.data.prediction?.is_fraud;
        const riskLevel = response.data.prediction?.risk_level;
        if (isFraud) {
          toast.error(`⚠️ Fraud detected! Risk level: ${riskLevel}`, {
            duration: 5000,
          });
        } else {
          toast.success(`✅ Transaction appears legitimate. Risk level: ${riskLevel}`);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Form Section */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4,
              background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
              border: '1px solid rgba(99,102,241,0.1)',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SecurityIcon sx={{ fontSize: 32, color: '#6366f1', mr: 2 }} />
              <Typography variant="h5" sx={{ color: 'white' }}>
                Fraud Detection Check
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  bgcolor: 'rgba(239,68,68,0.1)',
                  color: 'white',
                  '& .MuiAlert-icon': { color: '#ef4444' }
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
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
                    InputProps={{
                      startAdornment: <AttachMoneyIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="merchant"
                    name="merchant"
                    label="Merchant Name"
                    value={formik.values.merchant}
                    onChange={formik.handleChange}
                    error={formik.touched.merchant && Boolean(formik.errors.merchant)}
                    helperText={formik.touched.merchant && formik.errors.merchant}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    id="category"
                    name="category"
                    label="Category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    helperText={formik.touched.category && formik.errors.category}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                      '& .MuiMenuItem-root': { color: 'black' },
                    }}
                  >
                    {categories.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="user_age"
                    name="user_age"
                    label="Age"
                    type="number"
                    value={formik.values.user_age}
                    onChange={formik.handleChange}
                    error={formik.touched.user_age && Boolean(formik.errors.user_age)}
                    helperText={formik.touched.user_age && formik.errors.user_age}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Description (Optional)"
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      bgcolor: '#6366f1',
                      '&:hover': { bgcolor: '#4f46e5' },
                      position: 'relative',
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Check Transaction'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {result && (
            <Card 
              sx={{ 
                p: 4,
                height: '100%',
                background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
                border: '1px solid rgba(99,102,241,0.1)',
                borderRadius: 2,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
                  Analysis Results
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Transaction Risk Assessment
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  {result.prediction.risk_level === 'HIGH' ? (
                    <WarningIcon sx={{ fontSize: 48, color: '#ef4444' }} />
                  ) : result.prediction.risk_level === 'MEDIUM' ? (
                    <WarningIcon sx={{ fontSize: 48, color: '#f59e0b' }} />
                  ) : (
                    <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981' }} />
                  )}
                </Box>
                <Typography 
                  variant="h6" 
                  align="center"
                  sx={{ 
                    color: getRiskColor(result.prediction.risk_level),
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  {result.prediction.risk_level.toUpperCase()} RISK
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={result.prediction.fraud_probability * 100}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getRiskColor(result.prediction.risk_level),
                    },
                  }}
                />
                <Typography 
                  variant="body2" 
                  align="center" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    mt: 1,
                  }}
                >
                  Fraud Probability: {(result.prediction.fraud_probability * 100).toFixed(1)}%
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  Transaction Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Amount:
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      ${result.transaction.amount.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Merchant:
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {result.transaction.merchant}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Category:
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {result.transaction.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Date:
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {new Date(result.transaction.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Chip
                  label={`${result.credits_remaining} Credits Remaining`}
                  sx={{
                    bgcolor: 'rgba(99,102,241,0.1)',
                    color: '#6366f1',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}
                />
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}