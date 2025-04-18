import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import EventCard from '../components/EventCard';
import API_URL from '../config/api';

function Dashboard() {
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/user/events`);
        setUserEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Не удалось загрузить ваши мероприятия');
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, []);

  const handleCancelRegistration = async (eventId) => {
    try {
      await axios.delete(`${API_URL}/api/registration/${eventId}`);
      setUserEvents(userEvents.filter(event => event.id !== eventId));
    } catch (err) {
      setError('Не удалось отменить регистрацию');
    }
  };

  if (loading) {
    return <div className="dashboard-container">Загрузка...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Личный кабинет</h1>
      <p>Добро пожаловать, {currentUser.name}!</p>
      
      <h2>Мои мероприятия</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {userEvents.length === 0 ? (
        <div>
          <p>Вы не зарегистрированы ни на одно мероприятие.</p>
          <Link to="/" className="btn btn-primary">Просмотреть доступные мероприятия</Link>
        </div>
      ) : (
        <div className="event-grid">
          {userEvents.map(event => (
            <div key={event.id} className="event-card">
              <EventCard event={event} />
              <button 
                className="btn btn-danger" 
                onClick={() => handleCancelRegistration(event.id)}
                style={{ marginTop: '10px' }}
              >
                Отменить регистрацию
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
