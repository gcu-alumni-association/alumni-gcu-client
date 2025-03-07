import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from '../../services/UserContext';
import api from '../../services/api';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const EventCard = () => {
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useUser();
  const rotationInterval = 25000;

  // Fetch events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events/get-events");
        const sortedEvents = response.data.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
        setEvents(sortedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Rotate current event being displayed
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [events]);

  const handleEventClick = (eventItem) => {
    navigate(`/events/${eventItem._id}`);
  };

  // Show nothing if no events are available
  if (events.length === 0) return null;

  const currentEvent = events[currentEventIndex];

  return (
    <div className="event-card-container">
      <h2 className="news-event-title">EVENTS</h2>
      <div className="event-card" onClick={() => handleEventClick(currentEvent)}>
        {currentEvent.images && currentEvent.images.length > 0 ? (
          <img
            src={`${BASE_URL}${currentEvent.images[0]}`}
            alt="Events Thumbnail"
            className="event-card-thumbnail"
          />
        ) : (
          <img src="./assets/gcu-building.jpg" alt="Default Thumbnail" className="event-card-thumbnail" />
        )}
        <div className="event-card-content">
          <span className="event-card-label">Event</span>
          <h3 className="event-card-title">{currentEvent.title}</h3>
          <p className="event-card-organizer">Organizer: {currentEvent.organizer}</p>
          <p className="event-card-date">
            Date: {new Date(currentEvent.event_date).toLocaleDateString()} 
            <span>Time: {currentEvent.event_time}</span>
          </p>
        </div>
      </div>
      <span className="read-more-span" onClick={() => navigate('/events')}>
        Read more events &#8594;
      </span>
    </div>
  );
};

export default EventCard;
