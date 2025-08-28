import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Language as WebsiteIcon,
  TrendingUp as StatsIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon
} from '@mui/icons-material';
import { sportsbookService } from '../services/sportsbookApi';
import SportsbookModal from '../components/SportsbookModal';

const SportsbooksPage = () => {
  const theme = useTheme();

  // State management
  const [sportsbooks, setSportsbooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSportsbook, setEditingSportsbook] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingSportsbook, setDeletingSportsbook] = useState(null);

  // Table and filtering states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);
  const [countryFilter, setCountryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSportsbook, setSelectedSportsbook] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Load data on component mount and when filters change
  useEffect(() => {
    loadSportsbooks();
    loadStats();
  }, [page, rowsPerPage, searchTerm, activeOnlyFilter, countryFilter, sortBy, sortOrder]);

  const loadSportsbooks = async () => {
    try {
      setLoading(true);
      const filters = {
        page: page + 1,
        per_page: rowsPerPage,
        search: searchTerm || undefined,
        active_only: activeOnlyFilter || undefined,
        country: countryFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const response = await sportsbookService.getSportsbooks(filters);
      setSportsbooks(response.sportsbooks || []);
      setTotalCount(response.pagination?.total_count || 0);
      setError('');
    } catch (err) {
      console.error('Error loading sportsbooks:', err);
      setError('Failed to load sportsbooks');
      setSportsbooks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await sportsbookService.getSportsbookStats();
      setStats(response);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleRefresh = () => {
    loadSportsbooks();
    loadStats();
  };

  const handleAddSportsbook = () => {
    setEditingSportsbook(null);
    setModalOpen(true);
  };

  const handleEditSportsbook = (sportsbook) => {
    setEditingSportsbook(sportsbook);
    setModalOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteSportsbook = (sportsbook) => {
    setDeletingSportsbook(sportsbook);
    setDeleteConfirmOpen(true);
    setAnchorEl(null);
  };

  const handleToggleActive = async (sportsbook) => {
    try {
      await sportsbookService.toggleSportsbookActive(sportsbook.id);
      setNotification({
        open: true,
        message: `Sportsbook ${sportsbook.is_active ? 'deactivated' : 'activated'} successfully`,
        severity: 'success'
      });
      loadSportsbooks();
      loadStats();
    } catch (err) {
      console.error('Error toggling sportsbook:', err);
      setNotification({
        open: true,
        message: 'Failed to toggle sportsbook status',
        severity: 'error'
      });
    }
    setAnchorEl(null);
  };

  const confirmDelete = async () => {
    if (!deletingSportsbook) return;

    try {
      await sportsbookService.deleteSportsbook(deletingSportsbook.id);
      setNotification({
        open: true,
        message: 'Sportsbook deleted successfully',
        severity: 'success'
      });
      loadSportsbooks();
      loadStats();
    } catch (err) {
      console.error('Error deleting sportsbook:', err);
      setNotification({
        open: true,
        message: err.response?.data?.error || 'Failed to delete sportsbook',
        severity: 'error'
      });
    }

    setDeleteConfirmOpen(false);
    setDeletingSportsbook(null);
  };

  const handleMenuOpen = (event, sportsbook) => {
    setAnchorEl(event.currentTarget);
    setSelectedSportsbook(sportsbook);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSportsbook(null);
  };

  const handleModalSuccess = () => {
    loadSportsbooks();
    loadStats();
    setNotification({
      open: true,
      message: `Sportsbook ${editingSportsbook ? 'updated' : 'created'} successfully`,
      severity: 'success'
    });
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Sportsbooks
              </Typography>
              <Typography variant="h4" component="div">
                {stats.total_sportsbooks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Active Sportsbooks
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {stats.active_sportsbooks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Inactive Sportsbooks
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                {stats.inactive_sportsbooks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Most Used
              </Typography>
              <Typography variant="h6" component="div">
                {stats.top_used_sportsbooks?.[0]?.sportsbook_name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.top_used_sportsbooks?.[0]?.bet_count || 0} bets
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Sportsbooks
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSportsbook}
          >
            Add Sportsbook
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by name or country..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Country"
              variant="outlined"
              size="small"
              fullWidth
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              placeholder="Filter by country..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={activeOnlyFilter}
                  onChange={(e) => setActiveOnlyFilter(e.target.checked)}
                  color="primary"
                />
              }
              label="Active Only"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm('');
                setCountryFilter('');
                setActiveOnlyFilter(false);
                setPage(0);
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Logo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Website</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading sportsbooks...
                </TableCell>
              </TableRow>
            ) : sportsbooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No sportsbooks found
                </TableCell>
              </TableRow>
            ) : (
              sportsbooks.map((sportsbook) => (
                <TableRow key={sportsbook.id} hover>
                  <TableCell>
                    {sportsbook.logo_url ? (
                      <Avatar
                        src={sportsbook.logo_url}
                        alt={sportsbook.name}
                        sx={{ width: 40, height: 40 }}
                        variant="rounded"
                      />
                    ) : (
                      <Avatar
                        sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                        variant="rounded"
                      >
                        {sportsbook.name.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {sportsbook.display_name || sportsbook.name}
                      </Typography>
                      {sportsbook.display_name && sportsbook.display_name !== sportsbook.name && (
                        <Typography variant="body2" color="textSecondary">
                          {sportsbook.name}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {sportsbook.country && (
                      <Chip
                        label={sportsbook.country}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sportsbook.is_active ? 'Active' : 'Inactive'}
                      color={sportsbook.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {sportsbook.website_url && (
                      <Tooltip title="Visit website">
                        <IconButton
                          size="small"
                          component="a"
                          href={formatUrl(sportsbook.website_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WebsiteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(sportsbook.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, sportsbook)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditSportsbook(selectedSportsbook)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleToggleActive(selectedSportsbook)}>
          {selectedSportsbook?.is_active ? (
            <ToggleOffIcon sx={{ mr: 1 }} />
          ) : (
            <ToggleOnIcon sx={{ mr: 1 }} />
          )}
          {selectedSportsbook?.is_active ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteSportsbook(selectedSportsbook)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Modal */}
      <SportsbookModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sportsbook={editingSportsbook}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deletingSportsbook?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SportsbooksPage;
