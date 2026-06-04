import { useState } from 'react';

function UserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: '',
    limbs: 4,
    superpowers: [],
    biography: '',
    checkbox: false
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [showForm, setShowForm] = useState(false);

  const superpowerOptions = [
    { value: 'immortality', label: 'Бессмертие' },
    { value: 'levitation', label: 'Левитация' },
    { value: 'teleportation', label: 'Телепортация' },
    { value: 'invisibility', label: 'Невидимость' },
    { value: 'super_strength', label: 'Суперсила' },
    { value: 'telepathy', label: 'Телепатия' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    }

    if (!formData.birth_date) {
      newErrors.birth_date = 'Дата рождения обязательна';
    }

    if (!formData.gender) {
      newErrors.gender = 'Выберите пол';
    }

    if (formData.limbs < 0) {
      newErrors.limbs = 'Количество конечностей должно быть положительным';
    }

    if (formData.superpowers.length === 0) {
      newErrors.superpowers = 'Выберите хотя бы одну суперспособность';
    }

    if (!formData.biography.trim()) {
      newErrors.biography = 'Биография обязательна';
    }

    if (!formData.checkbox) {
      newErrors.checkbox = 'Необходимо согласие с условиями';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'checkbox') {
      setFormData(prev => ({ ...prev, checkbox: checked }));
    } else if (name === 'superpowers') {
      const newSuperpowers = checked
        ? [...formData.superpowers, value]
        : formData.superpowers.filter(s => s !== value);
      setFormData(prev => ({ ...prev, superpowers: newSuperpowers }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus({ type: 'error', message: 'Пожалуйста, исправьте ошибки в форме' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/project/backend/index.php?q=api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: `Пользователь успешно создан! Логин: ${result.login}, Пароль: ${result.password}`
        });
        setCredentials({ login: result.login, password: result.password });
        setUserData(result);
      } else {
        throw new Error(result.message || 'Ошибка создания пользователя');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus({
        type: 'error',
        message: 'Ошибка отправки формы. Попробуйте снова.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus({ type: 'error', message: 'Пожалуйста, исправьте ошибки в форме' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const userId = userData.profile_url.split('/').pop();
      const response = await fetch(`/project/backend/index.php?q=api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${credentials.login}:${credentials.password}`)
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Данные успешно обновлены!'
        });
      } else {
        throw new Error(result.message || 'Ошибка обновления данных');
      }
    } catch (error) {
      console.error('Update error:', error);
      setStatus({
        type: 'error',
        message: 'Ошибка обновления данных. Попробуйте снова.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!credentials.login || !credentials.password) {
      setStatus({
        type: 'error',
        message: 'Введите логин и пароль'
      });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      let userId = null;
      let userData = null;

      for (let id = 1; id <= 100; id++) {
        try {
          const response = await fetch(`/project/backend/index.php?q=api/user/${id}`, {
            method: 'GET',
            headers: {
              'Authorization': 'Basic ' + btoa(`${credentials.login}:${credentials.password}`)
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.login === credentials.login) {
              userId = id;
              userData = result;
              break;
            }
          }
        } catch (e) {
          // Продолжаем поиск
        }
      }

      if (!userId || !userData) {
        throw new Error('Пользователь не найден или неверные данные');
      }

      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        birth_date: userData.birth_date,
        gender: userData.gender,
        limbs: userData.limbs,
        superpowers: userData.superpowers,
        biography: userData.biography,
        checkbox: userData.checkbox === 1
      });

      setUserData({ profile_url: `/project/backend/index.php?q=api/user/${userId}` });
      setIsAuthenticated(true);
      setShowForm(true);
      setStatus({
        type: 'success',
        message: 'Вы успешно вошли! Теперь можете редактировать свои данные.'
      });
    } catch (error) {
      console.error('Login error:', error);
      setStatus({
        type: 'error',
        message: 'Ошибка авторизации. Проверьте логин и пароль.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="user-form" className="contact-form">
      <div className="container">
        <h2 className="section__title">Вход и регистрация</h2>

        {!showForm && !isAuthenticated && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn--primary"
              style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
            >
              Зарегистрироваться
            </button>
          </div>
        )}

        {!isAuthenticated && showForm && (
          <div
            className="login-box"
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              maxWidth: '980px',
              margin: '0 auto 2rem',
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            <h3>Уже есть аккаунт? Войдите для редактирования</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <input
                  type="text"
                  placeholder="Логин"
                  value={credentials.login}
                  onChange={(e) => setCredentials(prev => ({ ...prev, login: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <input
                  type="password"
                  placeholder="Пароль"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <button
                onClick={handleLogin}
                className="btn btn--primary"
                disabled={!credentials.login || !credentials.password || loading}
                style={{ whiteSpace: 'nowrap' }}
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </div>
          </div>
        )}

        {userData && !isAuthenticated && (
          <div
            className="credentials-box"
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: '#d4edda',
              borderRadius: '8px',
              maxWidth: '980px',
              margin: '0 auto 2rem',
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            <h3>Ваши данные для входа (сохраните их!)</h3>
            <p><strong>Логин:</strong> {credentials.login}</p>
            <p><strong>Пароль:</strong> {credentials.password}</p>
            <p><strong>URL профиля:</strong> {userData.profile_url}</p>
            <p style={{ marginTop: '1rem', color: '#155724' }}>Используйте эти данные в форме входа выше для редактирования данных позже.</p>
          </div>
        )}

        {isAuthenticated && (
          <div
            className="credentials-box"
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: '#d1ecf1',
              borderRadius: '8px',
              maxWidth: '980px',
              margin: '0 auto 2rem',
              animation: 'slideDown 0.3s ease-out'
            }}
          >
            <p>Вы вошли как: <strong>{credentials.login}</strong></p>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setShowForm(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  birth_date: '',
                  gender: '',
                  limbs: 4,
                  superpowers: [],
                  biography: '',
                  checkbox: false
                });
                setStatus({ type: '', message: '' });
              }}
              className="btn btn--secondary"
              style={{ marginTop: '0.5rem' }}
            >
              Выйти
            </button>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={isAuthenticated ? handleUpdate : handleSubmit}
            className="form"
            noValidate
            style={{ animation: 'slideDown 0.3s ease-out' }}
          >
            <div className="form__row">
              <div className="form__group">
                <label htmlFor="name" className="form__label">Имя *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form__input ${errors.name ? 'form__input--error' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ваше имя"
                />
                {errors.name && <span className="form__error">{errors.name}</span>}
              </div>
              <div className="form__group">
                <label htmlFor="email" className="form__label">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form__input ${errors.email ? 'form__input--error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
                {errors.email && <span className="form__error">{errors.email}</span>}
              </div>
            </div>

            <div className="form__row">
              <div className="form__group">
                <label htmlFor="phone" className="form__label">Телефон *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`form__input ${errors.phone ? 'form__input--error' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (999) 123-45-67"
                />
                {errors.phone && <span className="form__error">{errors.phone}</span>}
              </div>
              <div className="form__group">
                <label htmlFor="birth_date" className="form__label">Дата рождения *</label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  className={`form__input ${errors.birth_date ? 'form__input--error' : ''}`}
                  value={formData.birth_date}
                  onChange={handleChange}
                />
                {errors.birth_date && <span className="form__error">{errors.birth_date}</span>}
              </div>
            </div>

            <div className="form__row">
              <div className="form__group">
                <label htmlFor="gender" className="form__label">Пол *</label>
                <select
                  id="gender"
                  name="gender"
                  className={`form__input ${errors.gender ? 'form__input--error' : ''}`}
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Выберите пол</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                  <option value="other">Другой</option>
                </select>
                {errors.gender && <span className="form__error">{errors.gender}</span>}
              </div>
              <div className="form__group">
                <label htmlFor="limbs" className="form__label">Количество конечностей *</label>
                <input
                  type="number"
                  id="limbs"
                  name="limbs"
                  className={`form__input ${errors.limbs ? 'form__input--error' : ''}`}
                  value={formData.limbs}
                  onChange={handleChange}
                  min="0"
                />
                {errors.limbs && <span className="form__error">{errors.limbs}</span>}
              </div>
            </div>

            <div className="form__group" style={{ marginBottom: '1.5rem' }}>
              <label className="form__label">Суперспособности *</label>
              <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                {superpowerOptions.map(power => (
                  <label key={power.value} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="superpowers"
                      value={power.value}
                      checked={formData.superpowers.includes(power.value)}
                      onChange={handleChange}
                    />
                    {power.label}
                  </label>
                ))}
              </div>
              {errors.superpowers && <span className="form__error">{errors.superpowers}</span>}
            </div>

            <div className="form__group">
              <label htmlFor="biography" className="form__label">Биография *</label>
              <textarea
                id="biography"
                name="biography"
                className={`form__textarea ${errors.biography ? 'form__input--error' : ''}`}
                rows="5"
                value={formData.biography}
                onChange={handleChange}
                placeholder="Расскажите о себе..."
              ></textarea>
              {errors.biography && <span className="form__error">{errors.biography}</span>}
            </div>

            <div className="form__group">
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="checkbox"
                  checked={formData.checkbox}
                  onChange={handleChange}
                />
                Я согласен с условиями *
              </label>
              {errors.checkbox && <span className="form__error">{errors.checkbox}</span>}
            </div>

            <button
              type="submit"
              className={`btn btn--primary btn--submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span className="btn__text">
                {loading ? 'Обработка...' : (isAuthenticated ? 'Обновить' : 'Отправить')}
              </span>
              {loading && <span className="btn__loader"></span>}
            </button>

            {status.message && (
              <div className={`form__message form__message--${status.type}`}>
                {status.message}
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export default UserForm;
