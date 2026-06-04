import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [userLogin, setUserLogin] = useState('');

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    try {
      const savedCredentials = localStorage.getItem('userCredentials');
      if (!savedCredentials) {
        navigate('/login');
        return;
      }

      const { login, password, userId } = JSON.parse(savedCredentials);

      if (parseInt(id) !== userId) {
        setStatus({ type: 'error', message: 'Нет доступа к этому профилю' });
        return;
      }

      setUserLogin(login);

      const response = await fetch(`/project/backend/index.php?q=api/user/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`)
        }
      });

      if (response.ok) {
        const result = await response.json();
        setFormData({
          name: result.name || '',
          email: result.email || '',
          phone: result.phone || '',
          company: result.company || '',
          message: result.message || ''
        });
      } else {
        throw new Error('Ошибка загрузки данных');
      }
    } catch (error) {
      console.error('Load error:', error);
      setStatus({ type: 'error', message: 'Ошибка загрузки данных' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Сообщение обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus({ type: 'error', message: 'Исправьте ошибки в форме' });
      return;
    }

    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const savedCredentials = localStorage.getItem('userCredentials');
      const { login, password } = JSON.parse(savedCredentials);

      const response = await fetch(`/project/backend/index.php?q=api/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${login}:${password}`)
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          message: formData.message
        })
      });

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Данные успешно обновлены!'
        });
      } else {
        throw new Error('Ошибка обновления');
      }
    } catch (error) {
      console.error('Update error:', error);
      setStatus({
        type: 'error',
        message: 'Ошибка обновления данных'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userCredentials');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src="project/project/img/video.mp4" type="video/mp4" />
      </video>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)',
        zIndex: 1
      }}></div>

      <div className="profile-container">
        <button onClick={() => navigate('/')} className="back-link">
          ← На главную
        </button>

        <div className="profile-header">
          <h1 className="profile-title">Профиль пользователя</h1>
          <div className="profile-info">
            <p className="profile-login">Логин: <strong>{userLogin}</strong></p>
            <button onClick={handleLogout} className="logout-button">
              Выйти
            </button>
          </div>
        </div>

        <h2 className="section-title">Редактирование заявки</h2>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Имя *</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Ваше имя"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="company">Компания</label>
            <input
              type="text"
              id="company"
              name="company"
              className="form-input"
              value={formData.company}
              onChange={handleChange}
              placeholder="Название компании"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Сообщение *</label>
            <textarea
              id="message"
              name="message"
              className={`form-textarea ${errors.message ? 'error' : ''}`}
              rows="5"
              value={formData.message}
              onChange={handleChange}
              placeholder="Расскажите о вашем проекте..."
            ></textarea>
            {errors.message && <span className="error-text">{errors.message}</span>}
          </div>

          <button
            type="submit"
            className="save-button"
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>

          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Profile;
