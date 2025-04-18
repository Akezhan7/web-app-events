import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  LinearProgress, 
  Alert, 
  Container,
  Skeleton 
} from '@mui/material';
import EventCard from '../components/EventCard';
import { AccessTime } from '@mui/icons-material';

function Home() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [nearestEventTitle, setNearestEventTitle] = useState('');

    useEffect(() => {
        // Получаем ближайшее мероприятие для таймера
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/events');
                setEvents(response.data);
                
                // Если есть мероприятия, устанавливаем таймер до ближайшего
                if (response.data.length > 0) {
                    const sortedEvents = [...response.data].sort((a, b) => 
                        new Date(a.date) - new Date(b.date)
                    );
                    
                    const nearestEvent = sortedEvents.find(event => 
                        new Date(event.date) > new Date()
                    );
                    
                    if (nearestEvent) {
                        const eventDate = new Date(nearestEvent.date);
                        const now = new Date();
                        const diffInSeconds = Math.floor((eventDate - now) / 1000);
                        setTimeLeft(diffInSeconds > 0 ? diffInSeconds : 0);
                        setNearestEventTitle(nearestEvent.title);
                    }
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Не удалось загрузить события. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };
        
        fetchEvents();
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return {
            days,
            hours,
            mins,
            secs
        };
    };

    const time = formatTime(timeLeft);

    // Скелетон загрузки для мероприятий
    const eventSkeletons = Array(3).fill(0).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
            <Paper elevation={2} sx={{ height: '100%' }}>
                <Skeleton variant="rectangular" height={200} />
                <Box sx={{ p: 2 }}>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                    <Box sx={{ mt: 2 }}>
                        <Skeleton variant="rectangular" width={120} height={36} />
                    </Box>
                </Box>
            </Paper>
        </Grid>
    ));

    if (loading) {
        return (
            <Container>
                <Box sx={{ my: 4 }}>
                    <Skeleton variant="text" height={60} />
                    <Skeleton variant="rectangular" height={160} sx={{ mt: 2, mb: 4 }} />
                    <Grid container spacing={3}>
                        {eventSkeletons}
                    </Grid>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
            </Container>
        );
    }

    return (
        <Box>
            <Typography 
                variant="h3" 
                component="h1" 
                align="center" 
                gutterBottom
                sx={{ fontWeight: 'bold', mt: 4 }}
            >
                Предстоящие события
            </Typography>
            
            {timeLeft > 0 && (
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        my: 4,
                        bgcolor: 'primary.dark',
                        color: 'white',
                        textAlign: 'center',
                        borderRadius: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <AccessTime sx={{ mr: 1 }} />
                        <Typography variant="h5" component="h2">
                            До начала события: {nearestEventTitle}
                        </Typography>
                    </Box>
                    
                    <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Grid item xs={3}>
                            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                                <Typography variant="h4">{time.days}</Typography>
                                <Typography variant="caption">дней</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={3}>
                            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                                <Typography variant="h4">{time.hours}</Typography>
                                <Typography variant="caption">часов</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={3}>
                            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                                <Typography variant="h4">{time.mins}</Typography>
                                <Typography variant="caption">минут</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={3}>
                            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                                <Typography variant="h4">{time.secs}</Typography>
                                <Typography variant="caption">секунд</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>
            )}
            
            {events.length === 0 ? (
                <Alert severity="info" sx={{ my: 4 }}>
                    Нет предстоящих мероприятий. Заходите позже!
                </Alert>
            ) : (
                <Grid container spacing={4}>
                    {events.map(event => (
                        <Grid item xs={12} sm={6} md={4} key={event.id}>
                            <EventCard event={event} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

export default Home;
