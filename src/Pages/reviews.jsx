import React, { useState, useEffect } from 'react';
import { Header } from "../components/Header.jsx";
import { useTranslation } from "../context/TranslationContext.jsx";
import '../index.css';
import '../components/review.css';
import { FaStar, FaThumbsUp, FaEdit, FaTrash, FaReply, FaFlag, FaSearch } from 'react-icons/fa';

export function Reviews() {
  const { t } = useTranslation();
  
  // Services from your services page
  const services = [
    t('hairCut') || 'Hair Cut',
    t('highlights') || 'Highlights',
    t('color') || 'Color',
    t('treatments') || 'Treatments',
    t('basicCut') || 'Basic Cut',
    t('layeredCut') || 'Layered Cut',
    t('fullColor') || 'Full Color',
    t('balayage') || 'Balayage',
  ];

  // Get current user from localStorage or create default
  const getCurrentUser = () => {
    const stored = localStorage.getItem('reviewUser');
    if (stored) {
      return JSON.parse(stored);
    }
    const defaultUser = {
      id: Date.now().toString(),
      name: 'Guest User',
      avatar: `https://ui-avatars.com/api/?name=Guest+User&background=a8556e&color=fff&size=128`,
      reviewCount: 0
    };
    localStorage.setItem('reviewUser', JSON.stringify(defaultUser));
    return defaultUser;
  };

  // Load reviews from localStorage
  const loadReviews = () => {
    const stored = localStorage.getItem('reviews');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map(r => ({
        ...r,
        date: new Date(r.date),
        replies: r.replies?.map(reply => ({
          ...reply,
          date: new Date(reply.date)
        })) || []
      }));
    }
    // Default reviews
    return [
      {
        id: '1',
        user: {
          id: 'user1',
          name: 'Sarah Martinez',
          avatar: 'https://ui-avatars.com/api/?name=Sarah+Martinez&background=a8556e&color=fff&size=128',
          reviewCount: 12
        },
        service: t('hairCut') || 'Hair Cut',
        rating: 5,
        text: 'Absolutely amazing experience! The stylist was so professional and really listened to what I wanted. My hair looks incredible!',
        image: null,
        likes: 8,
        likedBy: ['user2', 'user3'],
        replies: [],
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        edited: false
      },
      {
        id: '2',
        user: {
          id: 'user2',
          name: 'Emily Johnson',
          avatar: 'https://ui-avatars.com/api/?name=Emily+Johnson&background=c08497&color=fff&size=128',
          reviewCount: 5
        },
        service: t('balayage') || 'Balayage',
        rating: 5,
        text: 'Best balayage I\'ve ever had! The color is so natural and the technique was flawless. Highly recommend!',
        image: null,
        likes: 15,
        likedBy: ['user1', 'user3'],
        replies: [
          {
            id: 'reply1',
            user: {
              id: 'user3',
              name: 'Maria Garcia',
              avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=a8556e&color=fff&size=128'
            },
            text: 'I totally agree! I had the same experience last month.',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        edited: false
      },
      {
        id: '3',
        user: {
          id: 'user3',
          name: 'Maria Garcia',
          avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=a8556e&color=fff&size=128',
          reviewCount: 8
        },
        service: t('treatments') || 'Treatments',
        rating: 4,
        text: 'Great deep conditioning treatment! My hair feels so soft and healthy now. The staff is very friendly too.',
        image: null,
        likes: 6,
        likedBy: ['user1'],
        replies: [],
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        edited: false
      }
    ];
  };

  const [reviews, setReviews] = useState(loadReviews);
  const [currentUser] = useState(getCurrentUser);
  const [filterService, setFilterService] = useState(t('all') || 'All');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [formService, setFormService] = useState(services[0]);
  const [formRating, setFormRating] = useState(0);
  const [formHover, setFormHover] = useState(0);
  const [formText, setFormText] = useState('');
  const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [editingReview, setEditingReview] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState({});

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const serviceAverages = {};
  services.forEach(s => {
    const servReviews = reviews.filter(r => r.service === s);
    if (servReviews.length > 0) {
      serviceAverages[s] = (servReviews.reduce((sum, r) => sum + r.rating, 0) / servReviews.length).toFixed(1);
    }
  });

  // Filtered, searched, and sorted reviews
  let filteredReviews = filterService === (t('all') || 'All') 
    ? reviews 
    : reviews.filter(r => r.service === filterService);

  if (searchQuery) {
    filteredReviews = filteredReviews.filter(r => 
      r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.service.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'recent') return b.date - a.date;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
    return 0;
  });

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formRating === 0 || !formText.trim()) return;

    const newReview = {
      id: Date.now().toString(),
      user: {
        ...currentUser,
        reviewCount: (currentUser.reviewCount || 0) + 1
      },
      service: formService,
      rating: formRating,
      text: formText.trim(),
      image: formImagePreview,
      likes: 0,
      likedBy: [],
      replies: [],
      date: new Date(),
      edited: false
    };

    setReviews([newReview, ...reviews]);
    
    // Update user review count
    const updatedUser = { ...currentUser, reviewCount: (currentUser.reviewCount || 0) + 1 };
    localStorage.setItem('reviewUser', JSON.stringify(updatedUser));

    // Reset form
    setFormService(services[0]);
    setFormRating(0);
    setFormHover(0);
    setFormText('');
    setFormImage(null);
    setFormImagePreview(null);
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('imageTooLarge') || 'Image is too large. Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle like/unlike
  const handleLike = (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const likedBy = review.likedBy || [];
    const isLiked = likedBy.includes(currentUser.id);

    setReviews(reviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          likes: isLiked ? r.likes - 1 : r.likes + 1,
          likedBy: isLiked 
            ? likedBy.filter(id => id !== currentUser.id)
            : [...likedBy, currentUser.id]
        };
      }
      return r;
    }));
  };

  // Handle reply
  const handleReplyChange = (id, text) => {
    setReplyTexts({ ...replyTexts, [id]: text });
  };

  const handleReplySubmit = (reviewId) => {
    const text = replyTexts[reviewId];
    if (!text || !text.trim()) return;

    const newReply = {
      id: Date.now().toString(),
      user: currentUser,
      text: text.trim(),
      date: new Date()
    };

    setReviews(reviews.map(r => 
      r.id === reviewId 
        ? { ...r, replies: [...(r.replies || []), newReply] }
        : r
    ));

    setReplyTexts({ ...replyTexts, [reviewId]: '' });
    setShowReplyForm({ ...showReplyForm, [reviewId]: false });
  };

  // Handle edit
  const handleEdit = (review) => {
    setEditingReview(review.id);
    setFormText(review.text);
    setFormRating(review.rating);
    setFormService(review.service);
    setFormImagePreview(review.image);
  };

  const handleUpdate = (reviewId) => {
    if (!formText.trim() || formRating === 0) return;

    setReviews(reviews.map(r => 
      r.id === reviewId 
        ? { 
            ...r, 
            text: formText.trim(), 
            rating: formRating,
            service: formService,
            image: formImagePreview,
            edited: true,
            editDate: new Date()
          }
        : r
    ));

    setEditingReview(null);
    setFormText('');
    setFormRating(0);
    setFormService(services[0]);
    setFormImagePreview(null);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setFormText('');
    setFormRating(0);
    setFormService(services[0]);
    setFormImagePreview(null);
  };

  // Handle delete
  const handleDelete = (reviewId) => {
    if (window.confirm(t('confirmDelete') || 'Are you sure you want to delete this review?')) {
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
  };

  // Format date
  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return t('today') || 'Today';
    if (days === 1) return t('yesterday') || 'Yesterday';
    if (days < 7) return `${days} ${t('daysAgo') || 'days ago'}`;
    return date.toLocaleDateString();
  };

  const isLiked = (review) => {
    return (review.likedBy || []).includes(currentUser.id);
  };

  const isOwnReview = (review) => {
    return review.user.id === currentUser.id;
  };

  return (
    <div className="reviews-page">
      <Header />

      <div className="reviews-container">
        <h1 className="reviews-main-title">{t('reviewsTitle')}</h1>

        {/* Summary Card */}
        <div className="summary-card">
          <h2 className="summary-title">{t('summary')}</h2>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{totalReviews}</span>
              <span className="stat-label">{t('totalReviews')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{averageRating} ⭐</span>
              <span className="stat-label">{t('averageRating')}</span>
            </div>
          </div>
          {Object.keys(serviceAverages).length > 0 && (
            <div className="service-averages">
              <h3>{t('serviceRatings') || 'Service Ratings'}</h3>
              {Object.entries(serviceAverages).map(([service, avg]) => (
                <div key={service} className="service-avg-item">
                  <span>{service}</span>
                  <span className="avg-rating">{avg} ⭐</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={t('searchReviews') || 'Search reviews...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filters-row">
            <div className="filter-group">
              <label>{t('filterByService')}</label>
              <select 
                value={filterService} 
                onChange={(e) => setFilterService(e.target.value)}
                className="filter-select"
              >
                <option>{t('all')}</option>
                {services.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>{t('sortBy')}</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="recent">{t('mostRecent')}</option>
                <option value="rating">{t('highestRated')}</option>
                <option value="likes">{t('mostLiked')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="review-form">
          <h2 className="form-title">{editingReview ? (t('editReview') || 'Edit Review') : t('submitReview')}</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingReview) {
              handleUpdate(editingReview);
            } else {
              handleSubmit(e);
            }
          }}>
            <div className="form-group">
              <label>{t('service')}</label>
              <select 
                value={formService} 
                onChange={(e) => setFormService(e.target.value)}
                className="form-select"
                disabled={!!editingReview}
              >
                {services.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('rating')}</label>
              <div className="star-rating">
                {[...Array(5)].map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <FaStar
                      key={index}
                      className="star-icon"
                      color={starValue <= (formHover || formRating) ? '#ffc107' : '#e4e5e9'}
                      size={28}
                      onClick={() => setFormRating(starValue)}
                      onMouseEnter={() => setFormHover(starValue)}
                      onMouseLeave={() => setFormHover(formRating)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>{t('review')}</label>
              <textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                className="form-textarea"
                placeholder={t('writeReview')}
                required
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>{t('uploadImage')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-file-input"
              />
              {formImagePreview && (
                <div className="image-preview">
                  <img src={formImagePreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormImagePreview(null);
                      setFormImage(null);
                    }}
                    className="remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              {editingReview && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="cancel-button"
                >
                  {t('cancel') || 'Cancel'}
                </button>
              )}
              <button type="submit" className="submit-button">
                {editingReview ? (t('update') || 'Update') : t('submit')}
              </button>
            </div>
          </form>
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          <h2 className="reviews-list-title">
            {sortedReviews.length} {sortedReviews.length === 1 ? t('review') || 'Review' : t('reviews')}
          </h2>
          {sortedReviews.length === 0 ? (
            <div className="no-reviews">
              <p>{t('noReviewsFound')}</p>
            </div>
          ) : (
            sortedReviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-user">
                    <img 
                      src={review.user.avatar} 
                      alt={review.user.name} 
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <p className="user-name">{review.user.name}</p>
                      <p className="user-meta">
                        {review.user.reviewCount} {t('reviews')} • {formatDate(review.date)}
                        {review.edited && <span className="edited-badge"> ({t('edited') || 'Edited'})</span>}
                      </p>
                    </div>
                  </div>
                  {isOwnReview(review) && (
                    <div className="review-actions">
                      <button
                        onClick={() => handleEdit(review)}
                        className="action-btn edit-btn"
                        title={t('edit') || 'Edit'}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="action-btn delete-btn"
                        title={t('delete') || 'Delete'}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>

                <div className="review-service">
                  {review.service}
                </div>

                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      color={i < review.rating ? '#ffc107' : '#e4e5e9'}
                      size={18}
                    />
                  ))}
                </div>

                <p className="review-text">{review.text}</p>

                {review.image && (
                  <div className="review-image-container">
                    <img src={review.image} alt="Review" className="review-image" />
                  </div>
                )}

                <div className="review-footer">
                  <button
                    onClick={() => handleLike(review.id)}
                    className={`like-button ${isLiked(review) ? 'liked' : ''}`}
                  >
                    <FaThumbsUp />
                    <span>{review.likes || 0}</span>
                  </button>
                  <button
                    onClick={() => setShowReplyForm({
                      ...showReplyForm,
                      [review.id]: !showReplyForm[review.id]
                    })}
                    className="reply-button"
                  >
                    <FaReply />
                    <span>{t('reply')}</span>
                  </button>
                </div>

                {/* Replies */}
                {review.replies && review.replies.length > 0 && (
                  <div className="replies-section">
                    <h4 className="replies-title">
                      {review.replies.length} {review.replies.length === 1 ? t('reply') : t('replies')}
                    </h4>
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="reply-item">
                        <img
                          src={reply.user.avatar}
                          alt={reply.user.name}
                          className="reply-avatar"
                        />
                        <div className="reply-content">
                          <div className="reply-header">
                            <span className="reply-user">{reply.user.name}</span>
                            <span className="reply-date">{formatDate(reply.date)}</span>
                          </div>
                          <p className="reply-text">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {showReplyForm[review.id] && (
                  <div className="reply-form">
                    <textarea
                      value={replyTexts[review.id] || ''}
                      onChange={(e) => handleReplyChange(review.id, e.target.value)}
                      className="reply-textarea"
                      placeholder={t('addReply')}
                      rows="2"
                    />
                    <div className="reply-form-actions">
                      <button
                        onClick={() => {
                          setShowReplyForm({ ...showReplyForm, [review.id]: false });
                          setReplyTexts({ ...replyTexts, [review.id]: '' });
                        }}
                        className="cancel-reply-btn"
                      >
                        {t('cancel') || 'Cancel'}
                      </button>
                      <button
                        onClick={() => handleReplySubmit(review.id)}
                        className="submit-reply-btn"
                      >
                        {t('reply')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}