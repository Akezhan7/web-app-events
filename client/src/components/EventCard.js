import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  CardActions, 
  Box, 
  Chip 
} from '@mui/material';
import { Event, LocationOn } from '@mui/icons-material';

function EventCard({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Изображение по умолчанию, если не предоставлено
  const defaultImage = 'https://source.unsplash.com/random/400x200/?event';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={RouterLink} to={`/event/${event.id}`}>
        <CardMedia
          component="img"
          height="200"
          image={event.image_url || defaultImage}
          alt={event.title}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="h2">
            {event.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Event fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>
          
          {event.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {event.location}
              </Typography>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary">
            {event.description ? (
              event.description.length > 100 
                ? `${event.description.substring(0, 100)}...` 
                : event.description
            ) : 'Нет описания'}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button 
          size="small" 
          color="primary" 
          component={RouterLink} 
          to={`/event/${event.id}`}
        >
          Подробнее
        </Button>
        
        {/* Можно добавить чип со статусом или типом мероприятия */}
        <Chip 
          label="Активно" 
          size="small" 
          color="success" 
          variant="outlined" 
          sx={{ ml: 'auto' }} 
        />
      </CardActions>
    </Card>
  );
}

export default EventCard;
