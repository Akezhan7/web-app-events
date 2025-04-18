import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/events/${id}`);
        setEvent(response.data);
        
        // Проверяем, зарегистрирован ли пользователь на это мероприятие
        if (currentUser) {
          try {
            const userEventsResponse = await axios.get('http://localhost:3001/api/user/events');
            const registeredEventIds = userEventsResponse.data.map(e => e.id);
            setIsRegistered(registeredEventIds.includes(Number(id)));
          } catch (err) {
            console.error('Error checking registration:', err);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить данные о мероприятии');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, currentUser]);

  const handleRegister = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/registration', { event_id: id });
      setIsRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при регистрации');
    }
  };

  const handleCancelRegistration = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/registration/${id}`);
      setIsRegistered(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при отмене регистрации');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;
  if (!event) return <div>Мероприятие не найдено</div>;

  const eventDate = new Date(event.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="event-details">
      <h1>{event.title}</h1>
      
      {event.image_url && (
        <img 
          src={event.image_url} 
          alt={event.title} 
          style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }} 
        />
      )}
      
      <div className="event-info">
        <p><strong>Дата и время:</strong> {eventDate}</p>
        {event.location && <p><strong>Место проведения:</strong> {event.location}</p>}
      </div>
      
      <div className="event-description">
        <h3>Описание</h3>
        <p>{event.description}</p>
      </div>
      
      <div className="event-actions" style={{ marginTop: '20px' }}>
        {isRegistered ? (
          <button 
            className="btn btn-danger" 
            onClick={handleCancelRegistration}
          >
            Отменить регистрацию
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={handleRegister}
          >
            Зарегистрироваться
          </button>
        )}
      </div>
      
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default EventDetails;
