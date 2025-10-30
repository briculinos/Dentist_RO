import { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

export default function SignatureCanvas({ value, onChange, disabled = false, required = false }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Configure drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load existing signature if provided
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [value]);

  const startDrawing = (e) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    setIsDrawing(true);

    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    e.preventDefault();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    setHasSignature(true);

    // Convert canvas to base64 and notify parent
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange('');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
        Semnătură{required && ' *'}
      </Typography>

      <Paper
        elevation={1}
        sx={{
          border: '2px solid',
          borderColor: disabled ? 'grey.300' : 'primary.main',
          borderRadius: 1,
          p: 0,
          overflow: 'hidden',
          position: 'relative',
          bgcolor: disabled ? 'grey.50' : 'white',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            display: 'block',
            width: '100%',
            height: '200px',
            cursor: disabled ? 'not-allowed' : 'crosshair',
            touchAction: 'none',
          }}
        />

        {!disabled && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              display: 'flex',
              gap: 1,
            }}
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearSignature}
              disabled={!hasSignature}
              sx={{
                bgcolor: 'white',
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              Șterge
            </Button>
          </Box>
        )}
      </Paper>

      {!hasSignature && !disabled && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Semnează în căsuța de mai sus folosind mouse-ul sau degetul
        </Typography>
      )}
    </Box>
  );
}
