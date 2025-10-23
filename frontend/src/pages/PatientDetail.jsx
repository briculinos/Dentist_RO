import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { patientsAPI } from '../services/api';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      const response = await patientsAPI.getOne(id);
      setPatient(response.data);
    } catch (error) {
      console.error('Failed to load patient:', error);
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

  if (!patient) {
    return <Typography>Pacientul nu a fost găsit</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/patients')}
        sx={{ mb: 3 }}
      >
        Înapoi la pacienți
      </Button>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={600}>
          {patient.firstName} {patient.lastName}
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/evaluations/new/${patient.id}`)}
        >
          Evaluare nouă
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Informații personale
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1"><strong>CNP:</strong> {patient.cnp}</Typography>
                <Typography variant="body1"><strong>Adresă:</strong> {patient.address}</Typography>
                {patient.city && <Typography variant="body1"><strong>Oraș:</strong> {patient.city}</Typography>}
                {patient.county && <Typography variant="body1"><strong>Județ:</strong> {patient.county}</Typography>}
                {patient.phone && <Typography variant="body1"><strong>Telefon:</strong> {patient.phone}</Typography>}
                {patient.email && <Typography variant="body1"><strong>Email:</strong> {patient.email}</Typography>}
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Document:</strong> {patient.idType} {patient.idSeries} {patient.idNumber}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Evaluări medicale
              </Typography>
              {patient.evaluations && patient.evaluations.length > 0 ? (
                patient.evaluations.map((evaluation) => (
                  <Box
                    key={evaluation.id}
                    sx={{
                      p: 1,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onClick={() => navigate(`/evaluations/${evaluation.id}`)}
                  >
                    <Typography variant="body1">
                      {new Date(evaluation.evaluationDate).toLocaleDateString('ro-RO')} {new Date(evaluation.evaluationDate).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                      Status declarație - Salvat
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">Nu există evaluări</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
