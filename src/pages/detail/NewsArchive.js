import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../pages.css';  // Import the CSS file for styling

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsPerPage] = useState(10); // Number of news items per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/news/get-news');
        setNews(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  // Logic for displaying current news items
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleNewsClick = (newsItem) => {
    navigate(`/news/${newsItem._id}`);
  };

  return (
    <div className="news-container">
      <h2 className="news-title">News Category</h2>
      <div className="news-list">
        {currentNews.map((newsItem) => (
          <div key={newsItem._id} className="news-item" onClick={() => handleNewsClick(newsItem)}>
            <div className="news-thumbnail">
              <img src={newsItem.thumbnail || "./assets/gcu-building.jpg"} alt="News Thumbnail" />  {/* Placeholder for Thumbnail */}
            </div>
            <div className="news-content">
              <h3 className="news-headline">{newsItem.title}</h3>
              <p className="news-date">{new Date(newsItem.date).toLocaleDateString()}</p>
              <p className="news-summary">{newsItem.content.substring(0, 100)}...</p> {/* Display a summary */}
              <button className="read-more-btn">Read More</button>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="pagination">
        {[...Array(Math.ceil(news.length / newsPerPage)).keys()].map((number) => (
          <button key={number} onClick={() => paginate(number + 1)} className={`page-number ${currentPage === number + 1 ? 'active' : ''}`}>
            {number + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewsList;
