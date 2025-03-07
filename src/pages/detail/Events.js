import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../pages.css';
import { UserContext } from '../../services/UserContext';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';


const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events/get-events");
        const sortedEvents = response.data.sort(
          (a, b) => new Date(b.posted_date) - new Date(a.posted_date)
        );
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEventClick = (eventItem) => {
    navigate(`/events/${eventItem._id}`);
  };

  const totalPages = Math.ceil(events.length / eventsPerPage);

  return (
    <div className='main'>
      <div className="news-container">
        <div className="about-header">
          <h1>Events</h1>
        </div>
        <div className="news-list">
          {currentEvents.map((eventItem) => (
            <div key={eventItem._id} className="news-item" onClick={() => handleEventClick(eventItem)}>
              <div className="news-thumbnail">
                {eventItem.images && eventItem.images.length > 0 ? (
                  <img
                    src={`${BASE_URL}${eventItem.images[0]}`}
                    alt="Events Thumbnail"
                  />
                ) : (
                  <img src="./assets/gcu-building.jpg" alt="Default Thumbnail" />
                )}
              </div>
              <div className="news-content">
                <h3 className="news-headline">{eventItem.title}</h3>
                <p className="news-date">
                  {new Date(eventItem.event_date).toLocaleDateString()} at {eventItem.event_time}
                </p>
                <p className="news-summary">
                  {eventItem.content.substring(0, 100)}...
                </p>
                <button className="read-more-btn">Read More</button>
              </div>
            </div>
          ))}
        </div>
          <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
          stylePrefix="events"
      />
      </div>
    </div>
  );
};

export default EventList;
