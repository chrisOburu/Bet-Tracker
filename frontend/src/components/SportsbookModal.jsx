import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  useTheme
} from '@mui/material';
import { sportsbookService } from '../services/sportsbookApi';

const SportsbookModal = ({ 
  open, 
  onClose, 
  sportsbook = null, 
  onSuccess 
}) => {
  const theme = useTheme();
  const isEdit = Boolean(sportsbook);

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    website_url: '',
    logo_url: '',
    country: '',
    description: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Initialize form data when modal opens or sportsbook changes
  useEffect(() => {
    if (open) {
      if (isEdit && sportsbook) {
        setFormData({
          name: sportsbook.name || '',
          display_name: sportsbook.display_name || '',
          website_url: sportsbook.website_url || '',
          logo_url: sportsbook.logo_url || '',
          country: sportsbook.country || '',
          description: sportsbook.description || '',
          is_active: sportsbook.is_active !== undefined ? sportsbook.is_active : true
        });
      } else {
        // Reset form for new sportsbook
        setFormData({
          name: '',
          display_name: '',
          website_url: '',
          logo_url: '',
          country: '',
          description: '',
          is_active: true
        });
      }
      setErrors({});
      setSubmitError('');
    }
  }, [open, isEdit, sportsbook]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    const validation = sportsbookService.validateSportsbook(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      if (isEdit) {
        await sportsbookService.updateSportsbook(sportsbook.id, formData);
      } else {
        await sportsbookService.createSportsbook(formData);
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving sportsbook:', error);
      setSubmitError(
        error.response?.data?.error || 
        `Failed to ${isEdit ? 'update' : 'create'} sportsbook`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">
          {isEdit ? 'Edit Sportsbook' : 'Add New Sportsbook'}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Sportsbook Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name || "The official name of the sportsbook"}
                placeholder="e.g., Bet365"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="display_name"
                label="Display Name"
                value={formData.display_name}
                onChange={handleChange}
                fullWidth
                error={!!errors.display_name}
                helperText={errors.display_name || "Optional friendly display name"}
                placeholder="e.g., bet365"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="country"
                label="Country"
                value={formData.country}
                onChange={handleChange}
                fullWidth
                error={!!errors.country}
                helperText={errors.country || "Country where the sportsbook is based"}
                placeholder="e.g., United Kingdom"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Active"
                sx={{ mt: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="website_url"
                label="Website URL"
                value={formData.website_url}
                onChange={handleChange}
                fullWidth
                type="url"
                error={!!errors.website_url}
                helperText={errors.website_url || "Official website URL"}
                placeholder="https://www.example.com"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="logo_url"
                label="Logo URL"
                value={formData.logo_url}
                onChange={handleChange}
                fullWidth
                type="url"
                error={!!errors.logo_url}
                helperText={errors.logo_url || "URL to the sportsbook logo image"}
                placeholder="https://www.example.com/logo.png"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description || "Optional description of the sportsbook"}
                placeholder="Brief description of the sportsbook..."
              />
            </Grid>
          </Grid>

          {formData.logo_url && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Logo Preview:
              </Typography>
              <Box
                component="img"
                src={formData.logo_url}
                alt="Logo preview"
                sx={{
                  maxWidth: 200,
                  maxHeight: 100,
                  objectFit: 'contain',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SportsbookModal;
