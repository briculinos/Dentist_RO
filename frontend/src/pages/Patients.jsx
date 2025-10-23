import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { patientsAPI } from '../services/api';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    cnp: '',
    address: '',
    city: '',
    county: '',
    idType: 'C.I.',
    idSeries: '',
    idNumber: '',
    phone: '',
    email: '',
    gdprConsent: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
  }, [searchQuery]);

  const loadPatients = async () => {
    try {
      const response = await patientsAPI.getAll({ search: searchQuery, limit: 50 });
      setPatients(response.data.patients);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    setError('');

    if (!newPatient.firstName || !newPatient.lastName || !newPatient.cnp || !newPatient.address) {
      setError('Vă rugăm să completați toate câmpurile obligatorii');
      return;
    }

    if (!newPatient.gdprConsent) {
      setError('Consimțământul GDPR este obligatoriu');
      return;
    }

    try {
      const response = await patientsAPI.create(newPatient);
      setOpenDialog(false);
      navigate(`/evaluations/new/${response.data.id}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Eroare la crearea pacientului');
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight={600}>
          Pacienți
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ py: 1.5, px: 3 }}
        >
          Pacient nou
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Caută după nume, prenume sau CNP..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
      />

      <Grid container spacing={3}>
        {patients.map((patient) => (
          <Grid item xs={12} md={6} lg={4} key={patient.id}>
            <Card
              elevation={2}
              sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {patient.firstName} {patient.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  CNP: {patient.cnp}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {patient.address}
                </Typography>
                {patient.phone && (
                  <Typography variant="body2" color="text.secondary">
                    Tel: {patient.phone}
                  </Typography>
                )}
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  {patient._count.evaluations} evaluări
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {patients.length === 0 && (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 8 }}>
          Nu au fost găsiți pacienți
        </Typography>
      )}

      {/* New Patient Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h4">Pacient nou</Typography>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nume *"
                value={newPatient.lastName}
                onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prenume *"
                value={newPatient.firstName}
                onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="CNP *"
                value={newPatient.cnp}
                onChange={(e) => setNewPatient({ ...newPatient, cnp: e.target.value })}
                inputProps={{ maxLength: 13 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresă *"
                value={newPatient.address}
                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Oraș"
                value={newPatient.city}
                onChange={(e) => setNewPatient({ ...newPatient, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Județ"
                value={newPatient.county}
                onChange={(e) => setNewPatient({ ...newPatient, county: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tip document"
                value={newPatient.idType}
                onChange={(e) => setNewPatient({ ...newPatient, idType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Serie"
                value={newPatient.idSeries}
                onChange={(e) => setNewPatient({ ...newPatient, idSeries: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Număr"
                value={newPatient.idNumber}
                onChange={(e) => setNewPatient({ ...newPatient, idNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefon"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newPatient.gdprConsent}
                    onChange={(e) => setNewPatient({ ...newPatient, gdprConsent: e.target.checked })}
                  />
                }
                label="Pacientul și-a dat consimțământul pentru prelucrarea datelor personale conform GDPR *"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} size="large">
            Anulează
          </Button>
          <Button onClick={handleCreatePatient} variant="contained" size="large">
            Salvează și creează evaluare
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
