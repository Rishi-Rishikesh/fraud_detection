import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Avatar,
  CssBaseline,
  Paper,
  createTheme,
  ThemeProvider,
  Fade,
  Grid,
  Card,
  LinearProgress,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ShieldIcon from '@mui/icons-material/Shield';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff88',
      light: '#66ffaa',
      dark: '#00cc6a',
    },
    secondary: {
      main: '#6366f1',
    },
    background: {
      default: '#0a0f1e',
      paper: '#111827',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      background: 'linear-gradient(45deg, #00ff88 30%, #6366f1 90%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #111827 0%, #1e293b 50%, #0f172a 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 136, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'all 0.3s ease',
          },
        },
      },
    },
  },
});

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name should be at least 2 characters'),
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username should be at least 3 characters')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const SecurityIndicator = ({ password }) => {
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[a-z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(password);
  const getColor = () => {
    if (strength < 50) return '#ef4444';
    if (strength < 75) return '#f59e0b';
    return '#10b981';
  };

  return (
    <Box sx={{ mt: 1 }}>
      <LinearProgress 
        variant="determinate" 
        value={strength} 
        sx={{ 
          height: 6, 
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getColor(),
          }
        }} 
      />
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5, display: 'block' }}>
        Password strength: {strength}%
      </Typography>
    </Box>
  );
};

const SecurityFeature = ({ icon, title, description }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
    <Avatar sx={{ bgcolor: 'rgba(0, 255, 136, 0.1)', width: 40, height: 40, mr: 2 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
        {description}
      </Typography>
    </Box>
  </Box>
);

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        const result = await register({
          name: values.name,
          username: values.username,
          email: values.email,
          password: values.password,
        });

        if (result.success) {
          navigate('/login', { 
            state: { message: 'Registration successful! Please login.' } 
          });
        } else {
          setError(result.error);
        }
      } catch (error) {
        console.error('Registration error:', error);
        setError(error.response?.data?.detail || 'Registration failed. Please try again.');
      }
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container 
        component="main" 
        maxWidth="lg"
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          background: 'radial-gradient(circle at top right, #1e3a8a 0%, #0f172a 50%, #000000 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,255,136,0.1) 0%, rgba(99,102,241,0.1) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite',
          }}
        />

        <Fade in={true} timeout={800}>
          <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
            {/* Left Side - Security Features */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(30,41,59,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 255, 136, 0.1)',
                  borderRadius: 4,
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <ShieldIcon sx={{ fontSize: 40, color: '#00ff88', mr: 2 }} />
                  <Box>
                    <Typography variant="h3" component="h1" gutterBottom>
                      Fraud Guard
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Advanced Threat Protection
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                  Secure Your Digital Identity
                </Typography>

                <SecurityFeature
                  icon={<FingerprintIcon />}
                  title="Biometric-grade Security"
                  description="Multi-layered authentication and real-time monitoring"
                />
                <SecurityFeature
                  icon={<AnalyticsIcon />}
                  title="AI-Powered Detection"
                  description="Machine learning algorithms analyze patterns in real-time"
                />
                <SecurityFeature
                  icon={<VerifiedUserIcon />}
                  title="Enterprise Encryption"
                  description="Military-grade encryption for all your data and transactions"
                />
                <SecurityFeature
                  icon={<SecurityRoundedIcon />}
                  title="24/7 Monitoring"
                  description="Continuous surveillance and instant threat alerts"
                />

                <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(0, 255, 136, 0.05)', borderRadius: 3 }}>
                  <Typography variant="body2" sx={{ color: '#00ff88', fontWeight: 600, mb: 1 }}>
                    🔒 Security First
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Your security is our top priority. We employ industry-leading practices 
                    to ensure your data remains protected against emerging threats.
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Right Side - Registration Form */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={24}
                component="form"
                onSubmit={formik.handleSubmit}
                sx={{
                  p: { xs: 3, sm: 4, md: 5 },
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #00ff88, #6366f1)',
                  },
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar 
                    sx={{ 
                      m: '0 auto 16px',
                      bgcolor: 'rgba(0, 255, 136, 0.1)', 
                      width: 64, 
                      height: 64,
                      border: '2px solid rgba(0, 255, 136, 0.3)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  >
                    <LockOutlinedIcon sx={{ fontSize: 32, color: '#00ff88' }} />
                  </Avatar>
                  <Typography variant="h4" component="h2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                    Create Account
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Join our secure fraud detection platform
                  </Typography>
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      bgcolor: 'rgba(239,68,68,0.1)',
                      color: 'white',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 2,
                      '& .MuiAlert-icon': { color: '#ef4444' },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      autoComplete="name"
                      autoFocus
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                        },
                        '& .MuiInputLabel-root': { 
                          color: 'rgba(255,255,255,0.7)',
                          '&.Mui-focused': { color: '#00ff88' },
                        },
                        '& .MuiFormHelperText-root': { color: '#ef4444' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="username"
                      name="username"
                      label="Username"
                      autoComplete="username"
                      value={formik.values.username}
                      onChange={formik.handleChange}
                      error={formik.touched.username && Boolean(formik.errors.username)}
                      helperText={formik.touched.username && formik.errors.username}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                        },
                        '& .MuiInputLabel-root': { 
                          color: 'rgba(255,255,255,0.7)',
                          '&.Mui-focused': { color: '#00ff88' },
                        },
                        '& .MuiFormHelperText-root': { color: '#ef4444' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      autoComplete="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                        },
                        '& .MuiInputLabel-root': { 
                          color: 'rgba(255,255,255,0.7)',
                          '&.Mui-focused': { color: '#00ff88' },
                        },
                        '& .MuiFormHelperText-root': { color: '#ef4444' },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: 'rgba(255,255,255,0.5)' }}
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                        },
                        '& .MuiInputLabel-root': { 
                          color: 'rgba(255,255,255,0.7)',
                          '&.Mui-focused': { color: '#00ff88' },
                        },
                        '& .MuiFormHelperText-root': { color: '#ef4444' },
                      }}
                    />
                    <SecurityIndicator password={formik.values.password} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                      helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              sx={{ color: 'rgba(255,255,255,0.5)' }}
                            >
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                        },
                        '& .MuiInputLabel-root': { 
                          color: 'rgba(255,255,255,0.7)',
                          '&.Mui-focused': { color: '#00ff88' },
                        },
                        '& .MuiFormHelperText-root': { color: '#ef4444' },
                      }}
                    />
                  </Grid>

                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={formik.isSubmitting}
                  sx={{ 
                    mt: 4,
                    mb: 3,
                    py: 1.75,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #00ff88 0%, #6366f1 100%)',
                    boxShadow: '0 8px 25px rgba(0, 255, 136, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #6366f1 0%, #00ff88 100%)',
                      boxShadow: '0 12px 35px rgba(0, 255, 136, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  {formik.isSubmitting ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid #00ff88',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                          }}
                        />
                      </Box>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <SecurityRoundedIcon sx={{ mr: 1 }} />
                      Activate Secure Account
                    </>
                  )}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      '&:hover': { 
                        color: '#00ff88',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Already have a secure account? Sign In
                  </Link>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Fade>

        {/* Add floating animation */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </Container>
    </ThemeProvider>
  );
}