import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

// ✅ Validation Schema
const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be at least 6 characters')
    .required('Password is required'),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setError('');
        const result = await login(values.email, values.password, values.rememberMe);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0a1931 0%, #0f3460 50%, #16213e 100%)',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={12}
        sx={{
          width: '90%',
          maxWidth: 420,
          p: 5,
          borderRadius: 4,
          backdropFilter: 'blur(12px)',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#fff',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          transform: 'translateY(0)',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'translateY(-5px)' },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          gutterBottom
          sx={{
            background: 'linear-gradient(90deg, #00C896, #FFD700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Fraud Guard
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
          Secure Login Portal
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              width: '100%',
              borderRadius: 2,
              backgroundColor: 'rgba(255,0,0,0.1)',
              color: '#ff8080',
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          noValidate
          sx={{ width: '100%' }}
        >
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            id="email"
            name="email"
            label="Email Address"
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{ style: { color: 'white' } }}
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            name="password"
            label="Password"
            type="password"
            id="password"
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{ style: { color: 'white' } }}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                color="success"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
                sx={{ color: '#00C896' }}
              />
            }
            label={<span style={{ color: '#ccc' }}>Remember me</span>}
            sx={{ alignSelf: 'start', mt: 1 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.3,
              fontWeight: 'bold',
              borderRadius: 3,
              background: 'linear-gradient(90deg, #00C896, #FFD700)',
              color: '#0a1931',
              opacity: isSubmitting ? 0.7 : 1,
              '&:hover': {
                transform: isSubmitting ? 'none' : 'scale(1.03)',
                transition: 'all 0.25s ease-in-out',
                background: 'linear-gradient(90deg, #00a27a, #e0c200)',
              },
            }}
          >
            {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
          </Button>

          <Typography variant="body2" sx={{ color: '#ccc', mt: 1 }}>
            Don’t have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: '#FFD700',
                fontWeight: 'bold',
                '&:hover': { color: '#00C896' },
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
