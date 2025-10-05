import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';

export default function Profile() {
  const { user, updateCredits } = useAuth();
  const [openTopUp, setOpenTopUp] = useState(false);
  const [credits, setCredits] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTopUp = async () => {
    try {
      const response = await axios.post('/user/add-credits', {
        amount: parseInt(credits),
      });

      updateCredits(response.data.new_balance);
      setSuccess(`Successfully added ${credits} credits`);
      setOpenTopUp(false);
      setCredits('');
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to add credits');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mr: 3,
              bgcolor: 'primary.main',
              fontSize: '2rem',
            }}
          >
            {user?.name?.[0] || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h5">{user?.name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Account Details
          </Typography>
          <Typography variant="body1">
            Member since: {new Date(user?.created_at).toLocaleDateString()}
          </Typography>
          <Typography variant="body1">
            Available Credits: {user?.credits}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Usage Statistics
          </Typography>
          <Typography variant="body1">
            Total Predictions Made: {user?.total_predictions || 0}
          </Typography>
          <Typography variant="body1">
            Fraud Detected: {user?.fraud_detected || 0}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setOpenTopUp(true)}
          sx={{ mt: 2 }}
        >
          Top Up Credits
        </Button>

        <Dialog open={openTopUp} onClose={() => setOpenTopUp(false)}>
          <DialogTitle>Top Up Credits</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Number of Credits"
              type="number"
              fullWidth
              variant="outlined"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTopUp(false)}>Cancel</Button>
            <Button onClick={handleTopUp} variant="contained">
              Add Credits
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}