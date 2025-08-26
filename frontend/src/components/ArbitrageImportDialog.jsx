import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material';
import {
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { arbitrageService } from '../services/arbitrageApi.js';

const ArbitrageImportDialog = ({ open, onClose, onImportComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setImportResult(null);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      
      // Validate the JSON structure
      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid file format. Expected an array of arbitrage opportunities.');
      }

      // Import the data
      const result = await arbitrageService.importArbitrages(jsonData);
      setImportResult(result);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import arbitrage data');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setImportResult(null);
    setError('');
    onClose();
  };

  const resetFileInput = () => {
    const fileInput = document.getElementById('arbitrage-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <UploadIcon sx={{ mr: 1 }} />
          Import Arbitrage Data
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {!importResult && !error && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Upload a JSON file containing arbitrage opportunities. The file should contain an array of arbitrage objects.
            </Typography>
            
            <Box 
              sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                p: 4, 
                textAlign: 'center',
                mt: 2,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              }}
              onClick={() => document.getElementById('arbitrage-file-input').click()}
            >
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Choose a JSON file
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click here or drag and drop your arbitrage_opportunities.json file
              </Typography>
              
              <input
                id="arbitrage-file-input"
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </Box>
            
            {uploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Importing arbitrage data...
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        )}

        {importResult && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Import completed successfully!
              </Typography>
            </Alert>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Total Opportunities Processed"
                  secondary={importResult.total_processed || 0}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Successfully Imported"
                  secondary={importResult.successful_imports || 0}
                />
              </ListItem>
              
              {importResult.failed_imports > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Failed Imports"
                    secondary={importResult.failed_imports}
                  />
                </ListItem>
              )}
              
              {importResult.duplicates_skipped > 0 && (
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Duplicates Skipped"
                    secondary={importResult.duplicates_skipped}
                  />
                </ListItem>
              )}
            </List>
            
            {importResult.errors && importResult.errors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Import Errors:
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {importResult.errors.map((error, index) => (
                    <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {error}
                      </Typography>
                    </Alert>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {importResult && (
          <Button onClick={resetFileInput} color="primary">
            Import Another File
          </Button>
        )}
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArbitrageImportDialog;
