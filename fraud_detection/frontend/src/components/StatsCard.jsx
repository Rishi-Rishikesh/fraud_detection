import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatsCard({ title, value, color = 'primary', icon }) {
  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color === 'error' ? '#ffebee' : color === 'primary' ? '#e3f2fd' : '#f3e5f5'} 0%, #ffffff 100%)`,
        boxShadow: 3,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          {icon && <Box mr={1}>{icon}</Box>}
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={color} fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}