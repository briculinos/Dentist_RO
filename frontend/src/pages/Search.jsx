import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { searchAPI } from '../services/api';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ patients: [], evaluations: [] });
  const [searching, setSearching] = useState(false);

  const handleSearch = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults({ patients: [], evaluations: [] });
      return;
    }

    setSearching(true);
    try {
      const response = await searchAPI.search({ query: searchQuery });
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  return (
    <Box>
      <Typography variant="h3" fontWeight={600} gutterBottom>
        Căutare
      </Typography>

      <TextField
        fullWidth
        placeholder="Caută pacienți sau evaluări după nume, prenume sau CNP..."
        value={query}
        onChange={handleChange}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 28 }} />
            </InputAdornment>
          ),
        }}
      />

      {query.length >= 2 && (
        <>
          {results.patients.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Pacienți ({results.patients.length})
              </Typography>
              <Grid container spacing={2}>
                {results.patients.map((patient) => (
                  <Grid item xs={12} md={6} key={patient.id}>
                    <Card
                      elevation={2}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <CardContent>
                        <Typography variant="h6">
                          {patient.firstName} {patient.lastName}
                        </Typography>
                        <Typography color="text.secondary">
                          CNP: {patient.cnp}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {results.evaluations.length > 0 && (
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Evaluări ({results.evaluations.length})
              </Typography>
              <Grid container spacing={2}>
                {results.evaluations.map((evaluation, index) => (
                  <Grid item xs={12} md={6} key={evaluation.id}>
                    <Card
                      elevation={2}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => navigate(`/evaluations/${evaluation.id}`)}
                    >
                      <CardContent>
                        <Typography variant="h6">
                          {evaluation.patient.firstName} {evaluation.patient.lastName}
                        </Typography>
                        <Typography color="text.secondary">
                          CNP: {evaluation.patient.cnp}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography color="text.secondary">
                            Data/Ora: {new Date(evaluation.evaluationDate).toLocaleDateString('ro-RO')} {new Date(evaluation.evaluationDate).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          <Typography color="text.secondary">
                            Evaluare nr {results.evaluations.length - index}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {results.patients.length === 0 && results.evaluations.length === 0 && !searching && (
            <Typography variant="h6" color="text.secondary" align="center">
              Nu au fost găsite rezultate
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
