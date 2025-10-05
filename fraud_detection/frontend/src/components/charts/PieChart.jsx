import { Pie } from 'react-chartjs-2';
import { Box, Paper, Typography } from '@mui/material';

export default function PieChart({ data, title }) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <Pie options={options} data={data} />
      </Box>
    </Paper>
  );
}