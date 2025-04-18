import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Snackbar,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  Stack
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Event as EventIcon,
  Image,
  Description,
  LocationOn,
  Save,
  Cancel,
  Refresh
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

function AdminDashboard() {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Для формы создания/редактирования мероприятия
  const [editingEvent, setEditingEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(dayjs());
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Для диалога подтверждения удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Загрузка всех мероприятий
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/events`);
      // Сортировка по дате (сначала новейшие)
      const sortedEvents = response.data.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setEvents(sortedEvents);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить мероприятия: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Подготовка формы для создания нового мероприятия
  const handleNewEvent = () => {
    setEditingEvent(null);
    resetForm();
    // Плавная прокрутка к форме на мобильных устройствах
    document.getElementById('event-form').scrollIntoView({ behavior: 'smooth' });
  };

  // Подготовка формы для редактирования
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setEventDate(dayjs(event.date));
    setLocation(event.location || '');
    setImageUrl(event.image_url || '');
    // Плавная прокрутка к форме на мобильных устройствах
    document.getElementById('event-form').scrollIntoView({ behavior: 'smooth' });
  };

  // Сохранение мероприятия (создание или обновление)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showSnackbar('Название мероприятия обязательно', 'error');
      return;
    }
    
    const eventData = {
      title,
      description,
      date: eventDate.format(),
      location,
      image_url: imageUrl
    };
    
    try {
      setLoading(true);
      
      if (editingEvent) {
        // Обновление существующего мероприятия
        await axios.put(`${API_URL}/api/events/${editingEvent.id}`, eventData);
        showSnackbar('Мероприятие успешно обновлено');
      } else {
        // Создание нового мероприятия
        await axios.post(`${API_URL}/api/events`, eventData);
        showSnackbar('Мероприятие успешно создано');
      }
      
      resetForm();
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Произошла ошибка при сохранении мероприятия';
      showSnackbar(errorMsg, 'error');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Открытие диалога подтверждения удаления
  const confirmDelete = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  // Удаление мероприятия
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/api/events/${eventToDelete.id}`);
      setEvents(events.filter(event => event.id !== eventToDelete.id));
      showSnackbar('Мероприятие успешно удалено');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Не удалось удалить мероприятие';
      showSnackbar(errorMsg, 'error');
      setError(errorMsg);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  // Отображение сообщения в снекбаре
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Закрытие снекбара
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Очистка формы
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventDate(dayjs());
    setLocation('');
    setImageUrl('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ 
        backgroundColor: 'primary.main', 
        color: 'white', 
        p: 3, 
        borderRadius: 2, 
        mb: 4,
        boxShadow: 3 
      }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Панель управления мероприятиями
        </Typography>
        <Typography variant="subtitle1" align="center">
          Здесь вы можете создавать, редактировать и удалять мероприятия
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Форма создания/редактирования мероприятия */}
        <Grid item xs={12} md={5}>
          <Paper 
            id="event-form"
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: editingEvent ? `2px solid ${theme.palette.primary.main}` : 'none',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EventIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                {editingEvent ? 'Редактировать мероприятие' : 'Создать мероприятие'}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  required
                  id="event-title"
                  label="Название мероприятия"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                        <EventIcon fontSize="small" />
                      </Box>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  id="event-description"
                  label="Описание"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, mt: 1.5, color: 'text.secondary', display: 'flex' }}>
                        <Description fontSize="small" />
                      </Box>
                    )
                  }}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                  <DateTimePicker
                    label="Дата и время"
                    value={eventDate}
                    onChange={(newValue) => setEventDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>

                <TextField
                  fullWidth
                  id="event-location"
                  label="Место проведения"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                        <LocationOn fontSize="small" />
                      </Box>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  id="event-image"
                  label="URL изображения"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  variant="outlined"
                  placeholder="https://example.com/image.jpg"
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                        <Image fontSize="small" />
                      </Box>
                    )
                  }}
                />

                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button 
                    type="submit"
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                    fullWidth
                    startIcon={<Save />}
                  >
                    {editingEvent ? 'Обновить' : 'Создать'}
                  </Button>

                  {editingEvent && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleNewEvent}
                      fullWidth
                      startIcon={<Cancel />}
                    >
                      Отменить
                    </Button>
                  )}
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Таблица мероприятий */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Список мероприятий
              </Typography>
              
              <Box>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<Refresh />}
                  onClick={fetchEvents}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  Обновить
                </Button>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Add />}
                  onClick={handleNewEvent}
                >
                  Новое
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {events.length === 0 ? (
              <Alert severity="info">Мероприятий пока нет. Создайте первое мероприятие!</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 'none', maxHeight: '600px', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell>Дата и время</TableCell>
                      <TableCell>Место</TableCell>
                      <TableCell align="center">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{event.title}</Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(event.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>{event.location || '—'}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Редактировать">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleEditEvent(event)}
                              size="small"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить">
                            <IconButton 
                              color="error" 
                              onClick={() => confirmDelete(event)}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
          
          {/* Превью карточки мероприятия */}
          {title && (
            <Card sx={{ mt: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Предварительный просмотр</Typography>
                <Divider sx={{ mb: 2 }} />
                
                {imageUrl && (
                  <Box 
                    sx={{
                      height: 140,
                      background: `url(${imageUrl}) center/cover no-repeat`,
                      borderRadius: 1,
                      mb: 2
                    }}
                  />
                )}
                
                <Typography variant="h5" gutterBottom>{title}</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EventIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {eventDate.format('DD MMMM YYYY, HH:mm')}
                  </Typography>
                </Box>
                
                {location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {location}
                    </Typography>
                  </Box>
                )}
                
                {description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить мероприятие "{eventToDelete?.title}"? 
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleDeleteEvent} color="error" variant="contained" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminDashboard;
