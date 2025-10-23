import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { evaluationsAPI } from '../services/api';

export default function EvaluationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluation();
  }, [id]);

  const loadEvaluation = async () => {
    try {
      const response = await evaluationsAPI.getOne(id);
      setEvaluation(response.data);
    } catch (error) {
      console.error('Failed to load evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const YesNoDisplay = ({ value }) => (
    value ? (
      <Chip icon={<CheckCircleIcon />} label="Da" color="success" size="small" />
    ) : (
      <Chip icon={<CancelIcon />} label="Nu" color="default" size="small" />
    )
  );

  const formatAnesthesiaType = (type) => {
    const types = {
      LOCAL_REGIONAL: 'Loco-regională',
      SEDATION: 'Sedare',
      GENERAL: 'Generală',
      OTHER: 'Altul',
    };
    return types[type] || type;
  };

  const formatDentalAnesthesiaType = (type) => {
    const types = {
      NONE: 'Fără anestezie',
      LOCAL: 'Cu anestezie locală',
      LOCAL_WITH_INHALATION_SEDATION: 'Cu anestezie locală și sedare inhalatorie',
      LOCAL_WITH_IV_SEDATION: 'Cu anestezie locală și sedare intravenoasă',
      GENERAL: 'Cu anestezie generală',
    };
    return types[type] || type;
  };

  const formatDentalComplicationType = (type) => {
    const types = {
      FAINTING: 'Leșin',
      NAUSEA: 'Greață',
      ALLERGY: 'Alergii',
      OTHER: 'Altele',
    };
    return types[type] || type;
  };

  const formatDeclarantType = (type) => {
    const types = {
      PATIENT: 'Pacientul',
      LEGAL_REPRESENTATIVE: 'Reprezentant legal',
      FAMILY_MEMBER: 'Aparținător (soț/soție, frate/soră, etc.)',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!evaluation) {
    return <Alert severity="error">Evaluarea nu a fost găsită</Alert>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/patients/${evaluation.patientId}`)}
        sx={{ mb: 3 }}
      >
        Înapoi la pacient
      </Button>

      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h3" fontWeight={600} gutterBottom>
            CHESTIONAR DE EVALUARE A STĂRII GENERALE
          </Typography>
          <Typography variant="h5" color="primary">
            {evaluation.patient.firstName} {evaluation.patient.lastName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            CNP: {evaluation.patient.cnp}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Data evaluării: {new Date(evaluation.evaluationDate).toLocaleDateString('ro-RO')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Medic: {evaluation.user.firstName} {evaluation.user.lastName}
          </Typography>

          {/* Display evaluation data */}
          <Box sx={{ mt: 4 }}>
            {/* Section 1: Declarant Information */}
            <Accordion defaultExpanded elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  1. Informații declarant
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Cine completează formularul?</Typography>
                    <Typography variant="body1">{formatDeclarantType(evaluation.declarantType)}</Typography>
                  </Grid>
                  {evaluation.declarantType !== 'PATIENT' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Nume declarant</Typography>
                        <Typography variant="body1">{evaluation.declarantName || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Relația cu pacientul</Typography>
                        <Typography variant="body1">{evaluation.declarantRelation || '-'}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 2: Pregnancy */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  2. Sarcină (numai pentru femei)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Posibil gravidă</Typography>
                    <YesNoDisplay value={evaluation.isPossiblyPregnant} />
                  </Grid>
                  {evaluation.isPossiblyPregnant && evaluation.pregnancyWeeks && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Vârsta sarcinii (săptămâni)</Typography>
                      <Typography variant="body1">{evaluation.pregnancyWeeks}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">În perioada ciclului menstrual</Typography>
                    <YesNoDisplay value={evaluation.isInMenstrualCycle} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 3: Allergies */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  3. Alergii și intoleranțe
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Are alergii sau intoleranțe</Typography>
                    <YesNoDisplay value={evaluation.hasAllergies} />
                  </Grid>
                  {evaluation.hasAllergies && evaluation.allergiesDetails && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Detalii alergii</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {evaluation.allergiesDetails}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 4: Current Medications */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  4. Tratamente curente
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Current Medications */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Medicație curentă</Typography>
                    <Typography variant="body2" color="text.secondary">Urmează tratament medicamentos</Typography>
                    <YesNoDisplay value={evaluation.isOnMedication} />
                  </Grid>
                  {evaluation.isOnMedication && evaluation.medicationDetails && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Detalii medicație</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {evaluation.medicationDetails}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  {/* Antibiotics */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Antibiotice</Typography>
                    <Typography variant="body2" color="text.secondary">Tratament cu antibiotice în ultimele 2 săptămâni</Typography>
                    <YesNoDisplay value={evaluation.recentAntibiotics} />
                  </Grid>
                  {evaluation.recentAntibiotics && evaluation.antibioticsDetails && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Detalii antibiotice</Typography>
                      <Typography variant="body1">{evaluation.antibioticsDetails}</Typography>
                    </Grid>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  {/* Anticoagulants */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Anticoagulante</Typography>
                    <Typography variant="body2" color="text.secondary">Tratament cu anticoagulante</Typography>
                    <YesNoDisplay value={evaluation.onAnticoagulants} />
                  </Grid>
                  {evaluation.onAnticoagulants && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Medicament și doză</Typography>
                        <Typography variant="body1">{evaluation.anticoagulantName || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Valoare INR</Typography>
                        <Typography variant="body1">{evaluation.inrValue || '-'}</Typography>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  {/* Bisphosphonates */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Bifosfonați</Typography>
                    <Typography variant="body2" color="text.secondary">Tratament cu bifosfonați</Typography>
                    <YesNoDisplay value={evaluation.onBisphosphonates} />
                  </Grid>
                  {evaluation.onBisphosphonates && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Medicament și doză</Typography>
                        <Typography variant="body1">{evaluation.bisphosphonateName || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Calea de administrare</Typography>
                        <Typography variant="body1">
                          {evaluation.bisphosphonateRoute === 'INTRAVENOUS' ? 'Intravenoasă' :
                           evaluation.bisphosphonateRoute === 'ORAL' ? 'Orală' : '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Durata tratamentului</Typography>
                        <Typography variant="body1">{evaluation.bisphosphonateDuration || '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Valoarea β cross-laps</Typography>
                        <Typography variant="body1">{evaluation.betaCrossLaps || '-'}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 5: Heart Diseases */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  5. Boli cardiovasculare
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Are boli de inimă</Typography>
                    <YesNoDisplay value={evaluation.hasHeartDisease} />
                  </Grid>
                  {evaluation.hasHeartDisease && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Angină pectorală</Typography>
                        <YesNoDisplay value={evaluation.anginaPectoris} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Infarct miocardic</Typography>
                        <YesNoDisplay value={evaluation.myocardialInfarction} />
                      </Grid>
                      {evaluation.myocardialInfarction && evaluation.infarctionDate && (
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="body2" color="text.secondary">Când a avut loc infarctul</Typography>
                          <Typography variant="body1">{evaluation.infarctionDate}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Aritmii</Typography>
                        <YesNoDisplay value={evaluation.arrhythmia} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Blocuri</Typography>
                        <YesNoDisplay value={evaluation.heartBlock} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Insuficiență cardiacă</Typography>
                        <YesNoDisplay value={evaluation.heartFailure} />
                      </Grid>
                      {evaluation.heartFailure && evaluation.nyhaClass && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Clasa NYHA</Typography>
                          <Typography variant="body1">{evaluation.nyhaClass}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Valvulopatii</Typography>
                        <YesNoDisplay value={evaluation.valvulopathy} />
                      </Grid>
                      {evaluation.valvulopathy && evaluation.valvulopathyType && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Tipul valvulopatiei</Typography>
                          <Typography variant="body1">{evaluation.valvulopathyType}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Endocardită infecțioasă</Typography>
                        <YesNoDisplay value={evaluation.infectiousEndocarditis} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Intervenții chirurgicale cardiace</Typography>
                        <YesNoDisplay value={evaluation.cardiacSurgery} />
                      </Grid>
                      {evaluation.cardiacSurgery && evaluation.cardiacSurgeryDetails && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Detalii intervenții cardiace</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.cardiacSurgeryDetails}
                          </Typography>
                        </Grid>
                      )}
                      {evaluation.otherHeartConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli de inimă</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherHeartConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 6: Vascular Diseases */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  6. Boli vasculare
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Are boli vasculare</Typography>
                    <YesNoDisplay value={evaluation.hasVascularDisease} />
                  </Grid>
                  {evaluation.hasVascularDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Arteriopatie obliterantă</Typography>
                        <YesNoDisplay value={evaluation.obliterativeArteriopathy} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Tromboflebită</Typography>
                        <YesNoDisplay value={evaluation.thrombophlebitis} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Hipotensiune arterială</Typography>
                        <YesNoDisplay value={evaluation.hypotension} />
                      </Grid>
                      {evaluation.hypotension && evaluation.hypotensionBloodPressure && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Valorile tensiunii (mmHg)</Typography>
                          <Typography variant="body1">{evaluation.hypotensionBloodPressure}</Typography>
                        </Grid>
                      )}
                      {evaluation.hypotension && evaluation.hypotensionMedication && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Medicamente și gramaj (hipotensiune)</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.hypotensionMedication}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Hipertensiune arterială</Typography>
                        <YesNoDisplay value={evaluation.hypertension} />
                      </Grid>
                      {evaluation.hypertension && evaluation.hypertensionBloodPressure && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Valorile tensiunii (mmHg)</Typography>
                          <Typography variant="body1">{evaluation.hypertensionBloodPressure}</Typography>
                        </Grid>
                      )}
                      {evaluation.hypertension && evaluation.hypertensionMedication && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Medicamente și gramaj (hipertensiune)</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.hypertensionMedication}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Accident vascular cerebral</Typography>
                        <YesNoDisplay value={evaluation.stroke} />
                      </Grid>
                      {evaluation.stroke && evaluation.strokeDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Când a avut loc AVC</Typography>
                          <Typography variant="body1">{evaluation.strokeDate}</Typography>
                        </Grid>
                      )}
                      {evaluation.otherVascularConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli vasculare</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherVascularConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 7: Respiratory Diseases */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  7. Boli aparatului respirator
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Are boli respiratorii</Typography>
                    <YesNoDisplay value={evaluation.hasRespiratoryDisease} />
                  </Grid>
                  {evaluation.hasRespiratoryDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Astm bronșic</Typography>
                        <YesNoDisplay value={evaluation.bronchialAsthma} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Emfizem</Typography>
                        <YesNoDisplay value={evaluation.emphysema} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Bronșită cronică</Typography>
                        <YesNoDisplay value={evaluation.chronicBronchitis} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">TBC</Typography>
                        <YesNoDisplay value={evaluation.tuberculosis} />
                      </Grid>
                      {evaluation.tuberculosis && evaluation.tbTreatment && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Tratament TBC</Typography>
                          <Typography variant="body1">{evaluation.tbTreatment}</Typography>
                        </Grid>
                      )}
                      {evaluation.otherRespiratoryConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli respiratorii</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherRespiratoryConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 8: Digestive & Liver Diseases */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  8. Boli digestive și hepatice
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Boli digestive</Typography>
                    <Typography variant="body2" color="text.secondary">Are boli digestive</Typography>
                    <YesNoDisplay value={evaluation.hasDigestiveDisease} />
                  </Grid>
                  {evaluation.hasDigestiveDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Gastrite/ulcer gastro-duodenal</Typography>
                        <YesNoDisplay value={evaluation.gastritisUlcer} />
                      </Grid>
                      {evaluation.otherDigestiveConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli digestive</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherDigestiveConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Boli hepatice</Typography>
                    <Typography variant="body2" color="text.secondary">Are boli hepatice</Typography>
                    <YesNoDisplay value={evaluation.hasLiverDisease} />
                  </Grid>
                  {evaluation.hasLiverDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Steatoză hepatică</Typography>
                        <YesNoDisplay value={evaluation.hepaticSteatosis} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Hepatită cronică</Typography>
                        <YesNoDisplay value={evaluation.chronicHepatitis} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Ciroză</Typography>
                        <YesNoDisplay value={evaluation.cirrhosis} />
                      </Grid>
                      {evaluation.otherLiverConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli hepatice</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherLiverConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 9: Kidney & Diabetes */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  9. Boli renale și diabet
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Boli renale</Typography>
                    <Typography variant="body2" color="text.secondary">Are boli renale</Typography>
                    <YesNoDisplay value={evaluation.hasKidneyDisease} />
                  </Grid>
                  {evaluation.hasKidneyDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Insuficiență renală</Typography>
                        <YesNoDisplay value={evaluation.renalFailure} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Hemodializă</Typography>
                        <YesNoDisplay value={evaluation.onHemodialysis} />
                      </Grid>
                      {evaluation.onHemodialysis && evaluation.hemodialysisDetails && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Detalii hemodializă</Typography>
                          <Typography variant="body1">{evaluation.hemodialysisDetails}</Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Diabet</Typography>
                    <Typography variant="body2" color="text.secondary">Are diabet</Typography>
                    <YesNoDisplay value={evaluation.hasDiabetes} />
                  </Grid>
                  {evaluation.hasDiabetes && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Tratament cu insulină</Typography>
                        <YesNoDisplay value={evaluation.diabetesInsulin} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Tratament cu antidiabetice orale</Typography>
                        <YesNoDisplay value={evaluation.diabetesOralMeds} />
                      </Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 10: Endocrine, Rheumatic & Skeletal */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  10. Boli endocrine, reumatismale și scheletale
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Boli endocrine</Typography>
                    <Typography variant="body2" color="text.secondary">Are boli endocrine</Typography>
                    <YesNoDisplay value={evaluation.hasEndocrineDisease} />
                  </Grid>
                  {evaluation.hasEndocrineDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Hipotiroidie</Typography>
                        <YesNoDisplay value={evaluation.hypothyroidism} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Hipertiroidie</Typography>
                        <YesNoDisplay value={evaluation.hyperthyroidism} />
                      </Grid>
                      {evaluation.otherEndocrineConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli endocrine</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherEndocrineConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Boli reumatismale</Typography>
                    <Typography variant="body2" color="text.secondary">Are boli reumatismale</Typography>
                    <YesNoDisplay value={evaluation.hasRheumaticDisease} />
                  </Grid>
                  {evaluation.hasRheumaticDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Poliartrită reumatoidă</Typography>
                        <YesNoDisplay value={evaluation.rheumatoidArthritis} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Colagenoze</Typography>
                        <YesNoDisplay value={evaluation.collagenosis} />
                      </Grid>
                      {evaluation.otherRheumaticConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli reumatismale</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherRheumaticConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Boli scheletale</Typography>
                    <Typography variant="body2" color="text.secondary">Are boli scheletale</Typography>
                    <YesNoDisplay value={evaluation.hasSkeletalDisease} />
                  </Grid>
                  {evaluation.hasSkeletalDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Osteoporoză</Typography>
                        <YesNoDisplay value={evaluation.osteoporosis} />
                      </Grid>
                      {evaluation.otherSkeletalConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli scheletale</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherSkeletalConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 11: Neurological & Psychiatric */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  11. Boli neurologice și psihice
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Boli neurologice</Typography>
                    <Typography variant="body2" color="text.secondary">Are boli neurologice</Typography>
                    <YesNoDisplay value={evaluation.hasNeurologicalDisease} />
                  </Grid>
                  {evaluation.hasNeurologicalDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Epilepsie</Typography>
                        <YesNoDisplay value={evaluation.epilepsy} />
                      </Grid>
                      {evaluation.otherNeurologicalConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli neurologice</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherNeurologicalConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Boli psihice</Typography>
                    <Typography variant="body2" color="text.secondary">Are boli psihice</Typography>
                    <YesNoDisplay value={evaluation.hasPsychiatricDisease} />
                  </Grid>
                  {evaluation.hasPsychiatricDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Depresie</Typography>
                        <YesNoDisplay value={evaluation.depression} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Schizofrenie</Typography>
                        <YesNoDisplay value={evaluation.schizophrenia} />
                      </Grid>
                      {evaluation.otherPsychiatricConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli psihice</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherPsychiatricConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Manifestări neuro-vegetative</Typography>
                    <Typography variant="body2" color="text.secondary">Atacuri de panică</Typography>
                    <YesNoDisplay value={evaluation.panicAttacks} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 12: Hematological & Infectious */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  12. Boli hematologice și infecțioase
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Boli hematologice</Typography>
                    <Typography variant="body2" color="text.secondary">Are boli hematologice</Typography>
                    <YesNoDisplay value={evaluation.hasHematologicalDisease} />
                  </Grid>
                  {evaluation.hasHematologicalDisease && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Anemie</Typography>
                        <YesNoDisplay value={evaluation.anemia} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Thalasemie</Typography>
                        <YesNoDisplay value={evaluation.thalassemia} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Leucemie acută</Typography>
                        <YesNoDisplay value={evaluation.acuteLeukemia} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Leucemie cronică</Typography>
                        <YesNoDisplay value={evaluation.chronicLeukemia} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Hemofilie</Typography>
                        <YesNoDisplay value={evaluation.hemophilia} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Trombocitopenie</Typography>
                        <YesNoDisplay value={evaluation.thrombocytopenia} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">Boala von Willebrand</Typography>
                        <YesNoDisplay value={evaluation.vonWillebrandDisease} />
                      </Grid>
                      {evaluation.otherHematologicalConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli hematologice</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherHematologicalConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Boli infecțioase</Typography>
                    <Typography variant="body2" color="text.secondary">Are boli infecțioase</Typography>
                    <YesNoDisplay value={evaluation.hasInfectiousDisease} />
                  </Grid>
                  {evaluation.hasInfectiousDisease && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Hepatită virală B</Typography>
                        <YesNoDisplay value={evaluation.hepatitisB} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Hepatită virală C</Typography>
                        <YesNoDisplay value={evaluation.hepatitisC} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Hepatită virală D</Typography>
                        <YesNoDisplay value={evaluation.hepatitisD} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">HIV</Typography>
                        <YesNoDisplay value={evaluation.hiv} />
                      </Grid>
                      {evaluation.otherInfectiousConditions && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Alte boli infecțioase</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.otherInfectiousConditions}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 13: Neoplasms */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  13. Neoplasme (tumori)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Are sau a avut tumori</Typography>
                    <YesNoDisplay value={evaluation.hasNeoplasm} />
                  </Grid>
                  {evaluation.hasNeoplasm && evaluation.neoplasmDetails && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Detalii neoplasmuri</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {evaluation.neoplasmDetails}
                      </Typography>
                    </Grid>
                  )}
                  {evaluation.otherDiseases && (
                    <>
                      <Grid item xs={12}><Divider /></Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Alte boli nemenționate mai sus</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {evaluation.otherDiseases}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 14: Previous Surgeries */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  14. Intervenții chirurgicale anterioare
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Operații anterioare</Typography>
                    <YesNoDisplay value={evaluation.hadPreviousSurgery} />
                  </Grid>
                  {evaluation.hadPreviousSurgery && (
                    <>
                      {evaluation.surgeryDetails && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Ce intervenție/intervenții</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.surgeryDetails}
                          </Typography>
                        </Grid>
                      )}
                      {evaluation.surgeryAnesthesiaType && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Tipul de anestezie</Typography>
                          <Typography variant="body1">{formatAnesthesiaType(evaluation.surgeryAnesthesiaType)}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Au apărut incidente</Typography>
                        <YesNoDisplay value={evaluation.surgeryComplications} />
                      </Grid>
                      {evaluation.surgeryComplications && evaluation.surgeryComplicationsDetails && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Detalii incidente</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.surgeryComplicationsDetails}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Transfuzii de sânge/derivate</Typography>
                    <YesNoDisplay value={evaluation.hadBloodTransfusion} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 15: Previous Dental Treatments */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  15. Tratamente stomatologice anterioare
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Tratamente dentare anterioare</Typography>
                    <YesNoDisplay value={evaluation.hadDentalTreatment} />
                  </Grid>
                  {evaluation.hadDentalTreatment && (
                    <>
                      {evaluation.dentalAnesthesiaType && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Tipul de anestezie folosită</Typography>
                          <Typography variant="body1">{formatDentalAnesthesiaType(evaluation.dentalAnesthesiaType)}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Au apărut complicații la anestezie</Typography>
                        <YesNoDisplay value={evaluation.dentalComplications} />
                      </Grid>
                      {evaluation.dentalComplications && (
                        <>
                          {evaluation.dentalComplicationsType && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Tipul de complicație</Typography>
                              <Typography variant="body1">{formatDentalComplicationType(evaluation.dentalComplicationsType)}</Typography>
                            </Grid>
                          )}
                          {evaluation.dentalComplicationsDetails && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">Detalii suplimentare</Typography>
                              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {evaluation.dentalComplicationsDetails}
                              </Typography>
                            </Grid>
                          )}
                        </>
                      )}
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 16: Substance Use */}
            <Accordion elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  16. Consum de substanțe
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Tutun</Typography>
                    <Typography variant="body2" color="text.secondary">Fumător</Typography>
                    <YesNoDisplay value={evaluation.tobaccoUse} />
                  </Grid>
                  {evaluation.tobaccoUse && evaluation.tobaccoDetails && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Detalii consum tutun</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {evaluation.tobaccoDetails}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Alcool</Typography>
                    <Typography variant="body2" color="text.secondary">Consum de alcool</Typography>
                    <YesNoDisplay value={evaluation.alcoholUse} />
                  </Grid>
                  {evaluation.alcoholUse && (
                    <>
                      {evaluation.alcoholDetails && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Detalii consum alcool</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.alcoholDetails}
                          </Typography>
                        </Grid>
                      )}
                      {evaluation.alcoholWithdrawalIssues && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Probleme la întreruperea consumului</Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {evaluation.alcoholWithdrawalIssues}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}><Divider /></Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Droguri</Typography>
                    <Typography variant="body2" color="text.secondary">Consum de droguri</Typography>
                    <YesNoDisplay value={evaluation.drugUse} />
                  </Grid>
                  {evaluation.drugUse && evaluation.drugDetails && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Detalii consum droguri</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {evaluation.drugDetails}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Doctor Notes */}
            {evaluation.doctorNotes && (
              <Card elevation={2} sx={{ mt: 3, bgcolor: 'info.light' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Note medic
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {evaluation.doctorNotes}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Declaration */}
            <Card elevation={2} sx={{ mt: 3, bgcolor: 'success.light' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Declarație
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status declarație
                </Typography>
                <YesNoDisplay value={evaluation.declarationSigned} />
                {evaluation.declarationDate && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Data semnării: {new Date(evaluation.declarationDate).toLocaleDateString('ro-RO')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
