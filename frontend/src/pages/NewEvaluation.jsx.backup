import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormGroup,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { patientsAPI, evaluationsAPI } from '../services/api';

export default function NewEvaluation() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState('declarant');

  // Pre-screening for existing evaluations
  const [previousEvaluations, setPreviousEvaluations] = useState([]);
  const [showPreScreening, setShowPreScreening] = useState(false);
  const [quickMode, setQuickMode] = useState(false); // Only show declaration if no new problems

  const [formData, setFormData] = useState({
    // Declarant info
    declarantType: 'PATIENT',
    declarantName: '',
    declarantRelation: '',

    // Pregnancy
    isPossiblyPregnant: false,
    pregnancyWeeks: '',
    isInMenstrualCycle: false,

    // Allergies
    hasAllergies: false,
    allergiesDetails: '',

    // Current medications
    isOnMedication: false,
    medicationDetails: '',

    // Antibiotics
    recentAntibiotics: false,
    antibioticsDetails: '',

    // Anticoagulants
    onAnticoagulants: false,
    anticoagulantName: '',
    anticoagulantDose: '',
    inrValue: '',

    // Bisphosphonates
    onBisphosphonates: false,
    bisphosphonateName: '',
    bisphosphonateDose: '',
    bisphosphonateRoute: null,
    bisphosphonateDuration: '',
    betaCrossLaps: '',

    // Medical history
    hasMedicalHistory: false,
    congenitalDiseases: '',
    professionalDiseases: '',

    // Heart diseases
    hasHeartDisease: false,
    anginaPectoris: false,
    myocardialInfarction: false,
    infarctionDate: '',
    arrhythmia: false,
    heartBlock: false,
    heartFailure: false,
    nyhaClass: '',
    valvulopathy: false,
    valvulopathyType: '',
    infectiousEndocarditis: false,
    cardiacSurgery: false,
    cardiacSurgeryDetails: '',
    otherHeartConditions: '',

    // Vascular diseases
    hasVascularDisease: false,
    obliterativeArteriopathy: false,
    thrombophlebitis: false,
    hypotension: false,
    hypotensionBloodPressure: '',
    hypotensionMedication: '',
    hypertension: false,
    maxBloodPressure: '',
    hypertensionBloodPressure: '',
    hypertensionMedication: '',
    stroke: false,
    strokeDate: '',
    otherVascularConditions: '',

    // Respiratory diseases
    hasRespiratoryDisease: false,
    bronchialAsthma: false,
    emphysema: false,
    chronicBronchitis: false,
    tuberculosis: false,
    tbTreatment: '',
    otherRespiratoryConditions: '',

    // Digestive diseases
    hasDigestiveDisease: false,
    gastritisUlcer: false,
    otherDigestiveConditions: '',

    // Liver diseases
    hasLiverDisease: false,
    hepaticSteatosis: false,
    chronicHepatitis: false,
    cirrhosis: false,
    otherLiverConditions: '',

    // Kidney diseases
    hasKidneyDisease: false,
    renalFailure: false,
    onHemodialysis: false,
    hemodialysisDetails: '',

    // Diabetes
    hasDiabetes: false,
    diabetesInsulin: false,
    diabetesOralMeds: false,

    // Endocrine diseases
    hasEndocrineDisease: false,
    hypothyroidism: false,
    hyperthyroidism: false,
    otherEndocrineConditions: '',

    // Rheumatic diseases
    hasRheumaticDisease: false,
    rheumatoidArthritis: false,
    collagenosis: false,
    otherRheumaticConditions: '',

    // Skeletal diseases
    hasSkeletalDisease: false,
    osteoporosis: false,
    otherSkeletalConditions: '',

    // Neurological diseases
    hasNeurologicalDisease: false,
    epilepsy: false,
    otherNeurologicalConditions: '',

    // Psychiatric diseases
    hasPsychiatricDisease: false,
    depression: false,
    schizophrenia: false,
    otherPsychiatricConditions: '',

    // Neuro-vegetative
    panicAttacks: false,

    // Hematological diseases
    hasHematologicalDisease: false,
    anemia: false,
    thalassemia: false,
    acuteLeukemia: false,
    chronicLeukemia: false,
    hemophilia: false,
    thrombocytopenia: false,
    vonWillebrandDisease: false,
    otherHematologicalConditions: '',

    // Infectious diseases
    hasInfectiousDisease: false,
    hepatitisB: false,
    hepatitisC: false,
    hepatitisD: false,
    hiv: false,
    otherInfectiousConditions: '',

    // Neoplasms
    hasNeoplasm: false,
    neoplasmDetails: '',

    // Other diseases
    otherDiseases: '',

    // Previous surgeries
    hadPreviousSurgery: false,
    surgeryDetails: '',
    surgeryAnesthesiaType: null,
    surgeryComplications: false,
    surgeryComplicationsDetails: '',
    hadBloodTransfusion: false,

    // Dental treatments
    hadDentalTreatment: false,
    dentalAnesthesiaType: null,
    dentalComplications: false,
    dentalComplicationsType: null,
    dentalComplicationsDetails: '',

    // Substance use
    tobaccoUse: false,
    tobaccoDetails: '',
    alcoholUse: false,
    alcoholDetails: '',
    alcoholWithdrawalIssues: '',
    drugUse: false,
    drugDetails: '',

    // Declaration
    declarationSigned: false,
    doctorNotes: '',
  });

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      const [patientResponse, evaluationsResponse] = await Promise.all([
        patientsAPI.getOne(patientId),
        evaluationsAPI.getAll({ patientId, page: 1, limit: 1 }),
      ]);

      setPatient(patientResponse.data);

      // Check if patient has previous evaluations
      if (evaluationsResponse.data.evaluations.length > 0) {
        setPreviousEvaluations(evaluationsResponse.data.evaluations);
        setShowPreScreening(true);
      }
    } catch (error) {
      setError('Pacientul nu a fost găsit');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePreScreeningResponse = (hasNewProblems) => {
    setShowPreScreening(false);
    if (!hasNewProblems) {
      // Quick mode - only show declaration
      setQuickMode(true);
      setExpanded('declaration');
    } else {
      // Full evaluation mode
      setQuickMode(false);
      setExpanded('declarant');
    }
  };

  const handleSubmit = async () => {
    if (!formData.declarationSigned) {
      setError('Declarația trebuie semnată');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Clean up data - convert empty strings to null for integer fields
      const cleanedData = { ...formData };

      // Convert empty string to null for integer fields
      if (cleanedData.pregnancyWeeks === '') {
        cleanedData.pregnancyWeeks = null;
      } else if (cleanedData.pregnancyWeeks) {
        cleanedData.pregnancyWeeks = parseInt(cleanedData.pregnancyWeeks, 10);
      }

      const response = await evaluationsAPI.create({
        patientId,
        ...cleanedData,
      });

      navigate(`/evaluations/${response.data.id}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Eroare la salvarea evaluării');
      setSaving(false);
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
    return (
      <Alert severity="error">
        Pacientul nu a fost găsit
      </Alert>
    );
  }

  return (
    <Box>
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            CHESTIONAR DE EVALUARE A STĂRII GENERALE
          </Typography>
          <Typography variant="h5" color="primary">
            Pacient: {patient.firstName} {patient.lastName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            CNP: {patient.cnp}
          </Typography>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Pre-screening Dialog for existing evaluations */}
      <Dialog
        open={showPreScreening}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { p: 2 }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            Evaluare medicală
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Au apărut probleme medicale de la ultima evaluare?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Ultima evaluare: {previousEvaluations[0] && new Date(previousEvaluations[0].evaluationDate).toLocaleDateString('ro-RO')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => handlePreScreeningResponse(false)}
            sx={{ flex: 1, fontSize: '1.1rem', py: 1.5 }}
          >
            Nu
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => handlePreScreeningResponse(true)}
            sx={{ flex: 1, fontSize: '1.1rem', py: 1.5 }}
          >
            Da
          </Button>
        </DialogActions>
      </Dialog>

      {!quickMode && (
        <>
          {/* SECTION 1: Declarant */}
          <Accordion
            expanded={expanded === 'declarant'}
            onChange={() => setExpanded(expanded === 'declarant' ? false : 'declarant')}
            elevation={2}
          >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            1. Informații declarant
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl component="fieldset" fullWidth>
            <FormLabel sx={{ fontSize: '1.1rem', mb: 2 }}>
              Cine completează acest formular?
            </FormLabel>
            <RadioGroup
              value={formData.declarantType}
              onChange={(e) => handleChange('declarantType', e.target.value)}
            >
              <FormControlLabel
                value="PATIENT"
                control={<Radio />}
                label="Pacientul"
              />
              <FormControlLabel
                value="LEGAL_REPRESENTATIVE"
                control={<Radio />}
                label="Reprezentant legal"
              />
              <FormControlLabel
                value="FAMILY_MEMBER"
                control={<Radio />}
                label="Aparținător (soț/soție, frate/soră, etc.)"
              />
            </RadioGroup>
          </FormControl>

          {formData.declarantType !== 'PATIENT' && (
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Nume complet declarant"
                value={formData.declarantName}
                onChange={(e) => handleChange('declarantName', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Relația cu pacientul"
                value={formData.declarantRelation}
                onChange={(e) => handleChange('declarantRelation', e.target.value)}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 2: Pregnancy (only for females) */}
      <Accordion
        elevation={2}
        sx={{ mt: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            2. Sarcină (numai pentru femei)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isPossiblyPregnant}
                  onChange={(e) => handleChange('isPossiblyPregnant', e.target.checked)}
                />
              }
              label="Sunteți/este posibil să fiți gravidă?"
            />

            {formData.isPossiblyPregnant && (
              <TextField
                fullWidth
                label="Vârsta sarcinii (în săptămâni)"
                type="number"
                value={formData.pregnancyWeeks}
                onChange={(e) => handleChange('pregnancyWeeks', e.target.value)}
                sx={{ mt: 2 }}
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isInMenstrualCycle}
                  onChange={(e) => handleChange('isInMenstrualCycle', e.target.checked)}
                />
              }
              label="Sunteți în perioada ciclului menstrual?"
              sx={{ mt: 2 }}
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* SECTION 3: Allergies */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            3. Alergii și intoleranțe
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasAllergies}
                onChange={(e) => handleChange('hasAllergies', e.target.checked)}
              />
            }
            label="Suferiți de alergii sau intoleranțe medicamentoase sau nemedicamentoase?"
          />

          {formData.hasAllergies && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Precizați la ce sunteți alergic
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.allergiesDetails}
                onChange={(e) => handleChange('allergiesDetails', e.target.value)}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 4: Current Medications */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            4. Tratamente curente
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isOnMedication}
                onChange={(e) => handleChange('isOnMedication', e.target.checked)}
              />
            }
            label="Urmați un anumit tratament (medicamentos, homeopatic, fitoterapic etc.)?"
          />

          {formData.isOnMedication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Precizați medicamentul/produsul și doza administrată
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.medicationDetails}
                onChange={(e) => handleChange('medicationDetails', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.recentAntibiotics}
                onChange={(e) => handleChange('recentAntibiotics', e.target.checked)}
              />
            }
            label="Ați urmat tratament cu antibiotice în ultimele două săptămâni?"
          />

          {formData.recentAntibiotics && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Precizați medicamentul și doza
              </Typography>
              <TextField
                fullWidth
                value={formData.antibioticsDetails}
                onChange={(e) => handleChange('antibioticsDetails', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.onAnticoagulants}
                onChange={(e) => handleChange('onAnticoagulants', e.target.checked)}
              />
            }
            label="Urmați tratament cu anticoagulante?"
          />

          {formData.onAnticoagulants && (
            <Grid container spacing={2} sx={{ mt: 1, pl: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Medicamentul și doza
                </Typography>
                <TextField
                  fullWidth
                  value={formData.anticoagulantName}
                  onChange={(e) => handleChange('anticoagulantName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Valoarea INR
                </Typography>
                <TextField
                  fullWidth
                  value={formData.inrValue}
                  onChange={(e) => handleChange('inrValue', e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          <Divider sx={{ my: 3 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.onBisphosphonates}
                onChange={(e) => handleChange('onBisphosphonates', e.target.checked)}
              />
            }
            label="Urmați tratament cu bifosfonați (Fosamax, Fosavance, Actonel, Bonviva, Zometa, Aclasta)?"
          />

          {formData.onBisphosphonates && (
            <Grid container spacing={2} sx={{ mt: 1, pl: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Medicamentul și doza
                </Typography>
                <TextField
                  fullWidth
                  value={formData.bisphosphonateName}
                  onChange={(e) => handleChange('bisphosphonateName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel>Calea de administrare</FormLabel>
                  <RadioGroup
                    value={formData.bisphosphonateRoute || ''}
                    onChange={(e) => handleChange('bisphosphonateRoute', e.target.value)}
                    row
                  >
                    <FormControlLabel value="INTRAVENOUS" control={<Radio />} label="Intravenoasă" />
                    <FormControlLabel value="ORAL" control={<Radio />} label="Orală" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Durata tratamentului (luni/ani)
                </Typography>
                <TextField
                  fullWidth
                  value={formData.bisphosphonateDuration}
                  onChange={(e) => handleChange('bisphosphonateDuration', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Valoarea β cross-laps
                </Typography>
                <TextField
                  fullWidth
                  value={formData.betaCrossLaps}
                  onChange={(e) => handleChange('betaCrossLaps', e.target.value)}
                />
              </Grid>
            </Grid>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 5: Medical History - Heart Diseases */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            5. Boli cardiovasculare
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasHeartDisease}
                onChange={(e) => handleChange('hasHeartDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli de inimă?"
          />

          {formData.hasHeartDisease && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.anginaPectoris}
                      onChange={(e) => handleChange('anginaPectoris', e.target.checked)}
                    />
                  }
                  label="Angină pectorală"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.myocardialInfarction}
                      onChange={(e) => handleChange('myocardialInfarction', e.target.checked)}
                    />
                  }
                  label="Infarct miocardic"
                />
                {formData.myocardialInfarction && (
                  <TextField
                    fullWidth
                    label="Când a avut loc infarctul?"
                    value={formData.infarctionDate}
                    onChange={(e) => handleChange('infarctionDate', e.target.value)}
                    sx={{ mt: 1, mb: 2 }}
                  />
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.arrhythmia}
                      onChange={(e) => handleChange('arrhythmia', e.target.checked)}
                    />
                  }
                  label="Aritmii (fibrilație etc.)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.heartBlock}
                      onChange={(e) => handleChange('heartBlock', e.target.checked)}
                    />
                  }
                  label="Blocuri"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.heartFailure}
                      onChange={(e) => handleChange('heartFailure', e.target.checked)}
                    />
                  }
                  label="Insuficiență cardiacă"
                />
                {formData.heartFailure && (
                  <TextField
                    fullWidth
                    label="Clasa NYHA"
                    value={formData.nyhaClass}
                    onChange={(e) => handleChange('nyhaClass', e.target.value)}
                    sx={{ mt: 1, mb: 2 }}
                  />
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.valvulopathy}
                      onChange={(e) => handleChange('valvulopathy', e.target.checked)}
                    />
                  }
                  label="Valvulopatii"
                />
                {formData.valvulopathy && (
                  <TextField
                    fullWidth
                    label="Precizați care"
                    value={formData.valvulopathyType}
                    onChange={(e) => handleChange('valvulopathyType', e.target.value)}
                    sx={{ mt: 1, mb: 2 }}
                  />
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.infectiousEndocarditis}
                      onChange={(e) => handleChange('infectiousEndocarditis', e.target.checked)}
                    />
                  }
                  label="Endocardită infecțioasă"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.cardiacSurgery}
                      onChange={(e) => handleChange('cardiacSurgery', e.target.checked)}
                    />
                  }
                  label="Intervenții chirurgicale cardiace"
                />
                {formData.cardiacSurgery && (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Precizați ce intervenții
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.cardiacSurgeryDetails}
                      onChange={(e) => handleChange('cardiacSurgeryDetails', e.target.value)}
                    />
                  </Box>
                )}
              </FormGroup>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli de inimă
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherHeartConditions}
                onChange={(e) => handleChange('otherHeartConditions', e.target.value)}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 6: Vascular Diseases */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            6. Boli vasculare
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasVascularDisease}
                onChange={(e) => handleChange('hasVascularDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli vasculare?"
          />

          {formData.hasVascularDisease && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.obliterativeArteriopathy}
                      onChange={(e) => handleChange('obliterativeArteriopathy', e.target.checked)}
                    />
                  }
                  label="Arteriopatie obliterantă"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.thrombophlebitis}
                      onChange={(e) => handleChange('thrombophlebitis', e.target.checked)}
                    />
                  }
                  label="Tromboflebită"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hypotension}
                      onChange={(e) => handleChange('hypotension', e.target.checked)}
                    />
                  }
                  label="Hipotensiune arterială"
                />
                {formData.hypotension && (
                  <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Indicați valorile tensiunii (mmHg)"
                        multiline
                        rows={2}
                        value={formData.hypotensionBloodPressure}
                        onChange={(e) => handleChange('hypotensionBloodPressure', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Medicamente și gramaj"
                        multiline
                        rows={2}
                        value={formData.hypotensionMedication}
                        onChange={(e) => handleChange('hypotensionMedication', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hypertension}
                      onChange={(e) => handleChange('hypertension', e.target.checked)}
                    />
                  }
                  label="Hipertensiune arterială"
                />
                {formData.hypertension && (
                  <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Indicați valorile tensiunii (mmHg)"
                        multiline
                        rows={2}
                        value={formData.hypertensionBloodPressure}
                        onChange={(e) => handleChange('hypertensionBloodPressure', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Medicamente și gramaj"
                        multiline
                        rows={2}
                        value={formData.hypertensionMedication}
                        onChange={(e) => handleChange('hypertensionMedication', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.stroke}
                      onChange={(e) => handleChange('stroke', e.target.checked)}
                    />
                  }
                  label="Accident vascular cerebral"
                />
                {formData.stroke && (
                  <TextField
                    fullWidth
                    label="Când a avut loc?"
                    value={formData.strokeDate}
                    onChange={(e) => handleChange('strokeDate', e.target.value)}
                    sx={{ mt: 1, mb: 2 }}
                  />
                )}
              </FormGroup>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli vasculare
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherVascularConditions}
                onChange={(e) => handleChange('otherVascularConditions', e.target.value)}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 7: Respiratory Diseases */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            7. Boli aparatului respirator
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasRespiratoryDisease}
                onChange={(e) => handleChange('hasRespiratoryDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli respiratorii?"
          />

          {formData.hasRespiratoryDisease && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.bronchialAsthma}
                      onChange={(e) => handleChange('bronchialAsthma', e.target.checked)}
                    />
                  }
                  label="Astm bronșic"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.emphysema}
                      onChange={(e) => handleChange('emphysema', e.target.checked)}
                    />
                  }
                  label="Emfizem"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.chronicBronchitis}
                      onChange={(e) => handleChange('chronicBronchitis', e.target.checked)}
                    />
                  }
                  label="Bronșită cronică"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.tuberculosis}
                      onChange={(e) => handleChange('tuberculosis', e.target.checked)}
                    />
                  }
                  label="TBC"
                />
                {formData.tuberculosis && (
                  <TextField
                    fullWidth
                    label="Ați urmat tratament?"
                    value={formData.tbTreatment}
                    onChange={(e) => handleChange('tbTreatment', e.target.value)}
                    sx={{ mt: 1, mb: 2 }}
                  />
                )}
              </FormGroup>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli respiratorii
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherRespiratoryConditions}
                onChange={(e) => handleChange('otherRespiratoryConditions', e.target.value)}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 8: Digestive & Liver Diseases */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            8. Boli digestive și hepatice
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom>Boli digestive</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasDigestiveDisease}
                onChange={(e) => handleChange('hasDigestiveDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli digestive?"
          />

          {formData.hasDigestiveDisease && (
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.gastritisUlcer}
                    onChange={(e) => handleChange('gastritisUlcer', e.target.checked)}
                  />
                }
                label="Gastrite/ulcer gastro-duodenal"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli digestive
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherDigestiveConditions}
                onChange={(e) => handleChange('otherDigestiveConditions', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Boli hepatice</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasLiverDisease}
                onChange={(e) => handleChange('hasLiverDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli hepatice?"
          />

          {formData.hasLiverDisease && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hepaticSteatosis}
                      onChange={(e) => handleChange('hepaticSteatosis', e.target.checked)}
                    />
                  }
                  label="Steatoză hepatică"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.chronicHepatitis}
                      onChange={(e) => handleChange('chronicHepatitis', e.target.checked)}
                    />
                  }
                  label="Hepatită cronică"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.cirrhosis}
                      onChange={(e) => handleChange('cirrhosis', e.target.checked)}
                    />
                  }
                  label="Ciroză"
                />
              </FormGroup>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli hepatice
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherLiverConditions}
                onChange={(e) => handleChange('otherLiverConditions', e.target.value)}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 9: Kidney Diseases & Diabetes */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            9. Boli renale și diabet
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom>Boli renale</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasKidneyDisease}
                onChange={(e) => handleChange('hasKidneyDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli renale?"
          />

          {formData.hasKidneyDisease && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.renalFailure}
                      onChange={(e) => handleChange('renalFailure', e.target.checked)}
                    />
                  }
                  label="Insuficiență renală"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.onHemodialysis}
                      onChange={(e) => handleChange('onHemodialysis', e.target.checked)}
                    />
                  }
                  label="Hemodializă"
                />
                {formData.onHemodialysis && (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Detalii hemodializă
                    </Typography>
                    <TextField
                      fullWidth
                      value={formData.hemodialysisDetails}
                      onChange={(e) => handleChange('hemodialysisDetails', e.target.value)}
                    />
                  </Box>
                )}
              </FormGroup>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Diabet</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasDiabetes}
                onChange={(e) => handleChange('hasDiabetes', e.target.checked)}
              />
            }
            label="Suferiți de diabet?"
          />

          {formData.hasDiabetes && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.diabetesInsulin}
                      onChange={(e) => handleChange('diabetesInsulin', e.target.checked)}
                    />
                  }
                  label="Tratament cu insulină"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.diabetesOralMeds}
                      onChange={(e) => handleChange('diabetesOralMeds', e.target.checked)}
                    />
                  }
                  label="Tratament cu antidiabetice orale"
                />
              </FormGroup>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 10: Endocrine, Rheumatic & Skeletal Diseases */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            10. Boli endocrine, reumatismale și scheletale
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom>Boli endocrine</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasEndocrineDisease}
                onChange={(e) => handleChange('hasEndocrineDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli endocrine?"
          />

          {formData.hasEndocrineDisease && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hypothyroidism}
                      onChange={(e) => handleChange('hypothyroidism', e.target.checked)}
                    />
                  }
                  label="Hipotiroidie"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hyperthyroidism}
                      onChange={(e) => handleChange('hyperthyroidism', e.target.checked)}
                    />
                  }
                  label="Hipertiroidie"
                />
              </FormGroup>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli endocrine
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherEndocrineConditions}
                onChange={(e) => handleChange('otherEndocrineConditions', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Boli reumatismale</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasRheumaticDisease}
                onChange={(e) => handleChange('hasRheumaticDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli reumatismale?"
          />

          {formData.hasRheumaticDisease && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.rheumatoidArthritis}
                      onChange={(e) => handleChange('rheumatoidArthritis', e.target.checked)}
                    />
                  }
                  label="Poliartrită reumatoidă"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.collagenosis}
                      onChange={(e) => handleChange('collagenosis', e.target.checked)}
                    />
                  }
                  label="Colagenoze"
                />
              </FormGroup>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli reumatismale
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherRheumaticConditions}
                onChange={(e) => handleChange('otherRheumaticConditions', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Boli scheletale</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasSkeletalDisease}
                onChange={(e) => handleChange('hasSkeletalDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli scheletale?"
          />

          {formData.hasSkeletalDisease && (
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.osteoporosis}
                    onChange={(e) => handleChange('osteoporosis', e.target.checked)}
                  />
                }
                label="Osteoporoză"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli scheletale
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherSkeletalConditions}
                onChange={(e) => handleChange('otherSkeletalConditions', e.target.value)}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 11: Neurological & Psychiatric Diseases */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            11. Boli neurologice și psihice
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom>Boli neurologice</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasNeurologicalDisease}
                onChange={(e) => handleChange('hasNeurologicalDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli neurologice?"
          />

          {formData.hasNeurologicalDisease && (
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.epilepsy}
                    onChange={(e) => handleChange('epilepsy', e.target.checked)}
                  />
                }
                label="Epilepsie"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli neurologice
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherNeurologicalConditions}
                onChange={(e) => handleChange('otherNeurologicalConditions', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Boli psihice</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasPsychiatricDisease}
                onChange={(e) => handleChange('hasPsychiatricDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli psihice?"
          />

          {formData.hasPsychiatricDisease && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.depression}
                      onChange={(e) => handleChange('depression', e.target.checked)}
                    />
                  }
                  label="Depresie"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.schizophrenia}
                      onChange={(e) => handleChange('schizophrenia', e.target.checked)}
                    />
                  }
                  label="Schizofrenie"
                />
              </FormGroup>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli psihice
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherPsychiatricConditions}
                onChange={(e) => handleChange('otherPsychiatricConditions', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Manifestări neuro-vegetative</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.panicAttacks}
                onChange={(e) => handleChange('panicAttacks', e.target.checked)}
              />
            }
            label="Atacuri de panică"
          />
        </AccordionDetails>
      </Accordion>

      {/* SECTION 12: Hematological & Infectious Diseases */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            12. Boli hematologice și infecțioase
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom>Boli hematologice</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasHematologicalDisease}
                onChange={(e) => handleChange('hasHematologicalDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli hematologice?"
          />

          {formData.hasHematologicalDisease && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.anemia}
                      onChange={(e) => handleChange('anemia', e.target.checked)}
                    />
                  }
                  label="Anemie"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.thalassemia}
                      onChange={(e) => handleChange('thalassemia', e.target.checked)}
                    />
                  }
                  label="Thalasemie"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.acuteLeukemia}
                      onChange={(e) => handleChange('acuteLeukemia', e.target.checked)}
                    />
                  }
                  label="Leucemie acută"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.chronicLeukemia}
                      onChange={(e) => handleChange('chronicLeukemia', e.target.checked)}
                    />
                  }
                  label="Leucemie cronică"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hemophilia}
                      onChange={(e) => handleChange('hemophilia', e.target.checked)}
                    />
                  }
                  label="Hemofilie"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.thrombocytopenia}
                      onChange={(e) => handleChange('thrombocytopenia', e.target.checked)}
                    />
                  }
                  label="Trombocitopenie"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.vonWillebrandDisease}
                      onChange={(e) => handleChange('vonWillebrandDisease', e.target.checked)}
                    />
                  }
                  label="Boala von Willebrand"
                />
              </FormGroup>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli hematologice
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherHematologicalConditions}
                onChange={(e) => handleChange('otherHematologicalConditions', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Boli infecțioase</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasInfectiousDisease}
                onChange={(e) => handleChange('hasInfectiousDisease', e.target.checked)}
              />
            }
            label="Suferiți de boli infecțioase?"
          />

          {formData.hasInfectiousDisease && (
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hepatitisB}
                      onChange={(e) => handleChange('hepatitisB', e.target.checked)}
                    />
                  }
                  label="Hepatită virală B"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hepatitisC}
                      onChange={(e) => handleChange('hepatitisC', e.target.checked)}
                    />
                  }
                  label="Hepatită virală C"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hepatitisD}
                      onChange={(e) => handleChange('hepatitisD', e.target.checked)}
                    />
                  }
                  label="Hepatită virală D"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hiv}
                      onChange={(e) => handleChange('hiv', e.target.checked)}
                    />
                  }
                  label="HIV"
                />
              </FormGroup>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                Alte boli infecțioase
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.otherInfectiousConditions}
                onChange={(e) => handleChange('otherInfectiousConditions', e.target.value)}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 13: Neoplasms */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            13. Neoplasme (tumori)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasNeoplasm}
                onChange={(e) => handleChange('hasNeoplasm', e.target.checked)}
              />
            }
            label="Aveți sau ați avut tumori?"
          />

          {formData.hasNeoplasm && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Precizați tipul de tumoare și tratamentul urmat
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.neoplasmDetails}
                onChange={(e) => handleChange('neoplasmDetails', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Alte boli care nu au fost menționate mai sus
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={formData.otherDiseases}
            onChange={(e) => handleChange('otherDiseases', e.target.value)}
          />
        </AccordionDetails>
      </Accordion>

      {/* SECTION 14: Previous Surgeries */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            14. Intervenții chirurgicale anterioare
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hadPreviousSurgery}
                onChange={(e) => handleChange('hadPreviousSurgery', e.target.checked)}
              />
            }
            label="Ați mai fost supus(ă) unor intervenții chirurgicale?"
          />

          {formData.hadPreviousSurgery && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Precizați ce intervenție/intervenții
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.surgeryDetails}
                onChange={(e) => handleChange('surgeryDetails', e.target.value)}
                sx={{ mb: 2 }}
              />

              <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                <FormLabel>Tipul de anestezie</FormLabel>
                <RadioGroup
                  value={formData.surgeryAnesthesiaType || ''}
                  onChange={(e) => handleChange('surgeryAnesthesiaType', e.target.value)}
                >
                  <FormControlLabel value="LOCAL_REGIONAL" control={<Radio />} label="Loco-regională" />
                  <FormControlLabel value="SEDATION" control={<Radio />} label="Sedare" />
                  <FormControlLabel value="GENERAL" control={<Radio />} label="Generală" />
                  <FormControlLabel value="OTHER" control={<Radio />} label="Altul" />
                </RadioGroup>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.surgeryComplications}
                    onChange={(e) => handleChange('surgeryComplications', e.target.checked)}
                  />
                }
                label="Au apărut incidente în timpul sau după intervenție?"
              />

              {formData.surgeryComplications && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Precizați ce anume
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.surgeryComplicationsDetails}
                    onChange={(e) => handleChange('surgeryComplicationsDetails', e.target.value)}
                  />
                </Box>
              )}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hadBloodTransfusion}
                onChange={(e) => handleChange('hadBloodTransfusion', e.target.checked)}
              />
            }
            label="Ați primit transfuzii de sânge/derivate?"
          />
        </AccordionDetails>
      </Accordion>

      {/* SECTION 15: Previous Dental Treatments */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            15. Tratamente stomatologice anterioare
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hadDentalTreatment}
                onChange={(e) => handleChange('hadDentalTreatment', e.target.checked)}
              />
            }
            label="Vi s-au mai efectuat tratamente stomatologice?"
          />

          {formData.hadDentalTreatment && (
            <Box sx={{ mt: 2 }}>
              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel>Tipul de anestezie folosită</FormLabel>
                <RadioGroup
                  value={formData.dentalAnesthesiaType || ''}
                  onChange={(e) => handleChange('dentalAnesthesiaType', e.target.value)}
                >
                  <FormControlLabel value="NONE" control={<Radio />} label="Fără anestezie" />
                  <FormControlLabel value="LOCAL" control={<Radio />} label="Cu anestezie locală" />
                  <FormControlLabel value="LOCAL_WITH_INHALATION_SEDATION" control={<Radio />} label="Cu anestezie locală și sedare inhalatorie" />
                  <FormControlLabel value="LOCAL_WITH_IV_SEDATION" control={<Radio />} label="Cu anestezie locală și sedare intravenoasă" />
                  <FormControlLabel value="GENERAL" control={<Radio />} label="Cu anestezie generală" />
                </RadioGroup>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.dentalComplications}
                    onChange={(e) => handleChange('dentalComplications', e.target.checked)}
                  />
                }
                label="Au apărut accidente/incidente sau complicații la utilizarea anestezicelor?"
              />

              {formData.dentalComplications && (
                <Box sx={{ mt: 2 }}>
                  <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                    <FormLabel>Tipul de complicație</FormLabel>
                    <RadioGroup
                      value={formData.dentalComplicationsType || ''}
                      onChange={(e) => handleChange('dentalComplicationsType', e.target.value)}
                    >
                      <FormControlLabel value="FAINTING" control={<Radio />} label="Leșin" />
                      <FormControlLabel value="NAUSEA" control={<Radio />} label="Greață" />
                      <FormControlLabel value="ALLERGY" control={<Radio />} label="Alergii" />
                      <FormControlLabel value="OTHER" control={<Radio />} label="Altele" />
                    </RadioGroup>
                  </FormControl>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Detalii suplimentare
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.dentalComplicationsDetails}
                    onChange={(e) => handleChange('dentalComplicationsDetails', e.target.value)}
                  />
                </Box>
              )}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* SECTION 16: Substance Use */}
      <Accordion elevation={2} sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5" fontWeight={600}>
            16. Consum de substanțe
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom>Tutun</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.tobaccoUse}
                onChange={(e) => handleChange('tobaccoUse', e.target.checked)}
              />
            }
            label="Sunteți/ați fost fumător?"
          />

          {formData.tobaccoUse && (
            <Box sx={{ mt: 2, mb: 3, pl: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Precizați ce cantitate și cât timp ați fumat/fumați
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.tobaccoDetails}
                onChange={(e) => handleChange('tobaccoDetails', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Alcool</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.alcoholUse}
                onChange={(e) => handleChange('alcoholUse', e.target.checked)}
              />
            }
            label="Consumați/ați consumat alcool?"
          />

          {formData.alcoholUse && (
            <Box sx={{ mt: 2, mb: 3, pl: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Precizați ce cantitate și cât timp ați consumat/consumați alcool
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.alcoholDetails}
                onChange={(e) => handleChange('alcoholDetails', e.target.value)}
                sx={{ mb: 3 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Ați avut probleme atunci când nu ați mai consumat alcool?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.alcoholWithdrawalIssues}
                onChange={(e) => handleChange('alcoholWithdrawalIssues', e.target.value)}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>Droguri</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.drugUse}
                onChange={(e) => handleChange('drugUse', e.target.checked)}
              />
            }
            label="Utilizați/ați utilizat droguri?"
          />

          {formData.drugUse && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Precizați ce drog/droguri utilizați
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.drugDetails}
                onChange={(e) => handleChange('drugDetails', e.target.value)}
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
        </>
      )}

      {/* Quick mode info message */}
      {quickMode && (
        <Alert severity="info" sx={{ mt: 3, fontSize: '1.1rem' }}>
          Nu au apărut probleme medicale noi de la ultima evaluare. Vă rugăm să confirmați declarația mai jos.
        </Alert>
      )}

      {/* FINAL SECTION: Declaration */}
      <Card elevation={2} sx={{ mt: 3, bgcolor: 'primary.light', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Declarație
          </Typography>
          <Typography variant="body1" paragraph>
            Certific că am citit și înțeles pe deplin cele de mai sus și declar că datele
            furnizate de mine în acest chestionar sunt reale și complete. Îmi asum întreaga
            responsabilitate pentru incidente sau complicații ce pot să apară în eventualitatea
            că aceste date sunt false sau incomplete.
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.declarationSigned}
                onChange={(e) => handleChange('declarationSigned', e.target.checked)}
                sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
              />
            }
            label={
              <Typography variant="h6" sx={{ color: 'white' }}>
                Confirm și semnez declarația
              </Typography>
            }
          />
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Note medic (opțional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Observații și recomandări"
            value={formData.doctorNotes}
            onChange={(e) => handleChange('doctorNotes', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          size="large"
          onClick={() => navigate(`/patients/${patientId}`)}
          disabled={saving}
        >
          Anulează
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSubmit}
          disabled={saving}
          sx={{ px: 4 }}
        >
          {saving ? 'Se salvează...' : 'Salvează evaluarea'}
        </Button>
      </Box>
    </Box>
  );
}
