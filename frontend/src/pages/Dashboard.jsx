import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { patientsAPI, evaluationsAPI } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalEvaluations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [patientsRes, evaluationsRes] = await Promise.all([
        patientsAPI.getAll({ page: 1, limit: 1 }),
        evaluationsAPI.getAll({ page: 1, limit: 1 }),
      ]);

      setStats({
        totalPatients: patientsRes.data.pagination.total,
        totalEvaluations: evaluationsRes.data.pagination.total,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/patients')}
          sx={{ py: 1.5, px: 3 }}
        >
          Pacient nou
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h3" fontWeight={600}>
                    {stats.totalPatients}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Total pacienți
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate('/patients')}
              >
                Vezi toți pacienții
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h3" fontWeight={600}>
                    {stats.totalEvaluations}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Total evaluări
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate('/search')}
              >
                Caută evaluări
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
