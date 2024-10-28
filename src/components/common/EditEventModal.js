import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../services/UserContext';
import '../components.css';

const EditEventModal = ({ eventId, isOpen, onClose, onEventUpdated }) => {
  const { user } = useContext(UserContext);
  const [eventData, setEventData] = useState({
    title: '',
    content: '',
    organizer: '',
    event_date: '',
    event_time: '',
    posted_date: '',
  });
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    if (user?.role !== 'admin' || !isOpen) return;

    // Fetch event data when the modal opens
    const fetchEventData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/get-event/${eventId}`);
        setEventData(response.data);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };
    fetchEventData();
  }, [eventId, user, isOpen]);

  // Handle input change for the form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  // const handleImageUpload = (images) => {
  //   setNewImages(images);
  // };

  // Submit updated event data
  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmEdit = window.confirm("Are you sure you want to update this event?");
    if (!confirmEdit) return;

    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => formData.append(key, value));
    newImages.forEach((image) => formData.append('images', image));

    try {
      await axios.put(`http://localhost:5000/api/events/edit/${eventId}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      onEventUpdated(); // Refresh event list or card
      onClose(); // Close modal
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content" style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Edit Event</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="text"
            name="title"
            value={eventData.title}
            onChange={handleInputChange}
            placeholder="Title"
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
          />
          <textarea
            name="content"
            value={eventData.content}
            onChange={handleInputChange}
            placeholder="Content"
            rows="4"
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
          ></textarea>
          <input
            type="text"
            name="organizer"
            value={eventData.organizer}
            onChange={handleInputChange}
            placeholder="Organizer"
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
          />
          <input
            type="date"
            name="event_date"
            value={eventData.event_date}
            onChange={handleInputChange}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
          />
          <input
            type="time"
            name="event_time"
            value={eventData.event_time}
            onChange={handleInputChange}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
          />
          <input
            type="date"
            name="posted_date"
            value={eventData.posted_date}
            onChange={handleInputChange}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
          />
          <button
            type="submit"
            style={{ padding: "10px", borderRadius: "5px", backgroundColor: "#4CAF50", color: "white", fontSize: "16px", cursor: "pointer" }}
          >
            Update Event
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ marginTop: "10px", padding: "10px", borderRadius: "5px", backgroundColor: "#f44336", color: "white", fontSize: "16px", cursor: "pointer" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;
