import { Bar } from 'react-chartjs-2';
import { Box, Paper, Typography } from '@mui/material';

export default function BarChart({ data, title }) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: 300 }}>
        <Bar options={options} data={data} />
      </Box>
    </Paper>
  );
}