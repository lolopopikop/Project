import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.login || !credentials.password) {
      setError('Введите логин и пароль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Ищем пользователя по логину
      let userId = null;

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
              break;
            }
          }
        } catch (e) {
          // Продолжаем поиск
        }
      }

      if (!userId) {
        throw new Error('Неверный логин или пароль');
      }

      // Сохраняем credentials в localStorage
      localStorage.setItem('userCredentials', JSON.stringify({
        login: credentials.login,
        password: credentials.password,
        userId: userId
      }));

      // Переходим на страницу профиля
      navigate(`/profile/${userId}`);
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка авторизации. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
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

      <div className="login-container" style={{position:"relative", zIndex:2}}>
        <button onClick={() => navigate('/')} className="back-link">
          ← На главную
        </button>

        <h1 className="login-title">
          Уже отправляли заявку? Войдите, чтобы изменить данные
        </h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Логин"
              value={credentials.login}
              onChange={(e) => setCredentials(prev => ({ ...prev, login: e.target.value }))}
              className="login-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Пароль"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="login-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
