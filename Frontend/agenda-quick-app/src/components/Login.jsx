import { useState } from 'react';
import './Login.css';

/**
 * Login — Tela de autenticação do AgendaQuick.
 * Suporta login via SSO (simulado) ou Usuário/Senha.
 * Em produção, conectar ao endpoint de autenticação do backend.
 *
 * Props:
 * - onLogin(user): callback chamado quando autenticação é bem-sucedida
 */
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validação básica
    if (!email.trim() || !password.trim()) {
      triggerError('Preencha todos os campos para continuar.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Falha na autenticação');
      }

      const data = await response.json();
      
      // Armazena o token para persistência (opcional, mas recomendado)
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify({
        name: data.user_name,
        role: data.user_type,
        email: email
      }));

      onLogin({
        name: data.user_name,
        role: data.user_type,
        email: email,
        token: data.access_token
      });
    } catch (err) {
      triggerError(err.message || 'Erro ao conectar ao servidor.');
    }
  }

  function handleSSO() {
    // Simulação de SSO (em produção: redirect para OAuth2/SAML)
    onLogin({
      name: 'Dra. Ana Silva',
      role: 'Cirurgiã Chefe',
      email: 'ana.silva@hospital.com',
    });
  }

  function triggerError(msg) {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }

  return (
    <div className="login-page">
      <div className={`login-card ${shaking ? 'shake' : ''}`}>
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">🏥</span>
          <div className="login-logo-text">
            Agenda<span>Quick</span>
          </div>
          <div className="login-subtitle">
            Sistema de Agendamento de Centros Cirúrgicos
          </div>
        </div>

        {/* SSO Button */}
        <button className="sso-btn" onClick={handleSSO} type="button">
          <span className="sso-icon">🔐</span>
          Entrar com SSO Corporativo
        </button>

        {/* Divider */}
        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">ou acesse com sua conta</span>
          <div className="login-divider-line" />
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">E-mail</label>
            <input
              className="login-input"
              type="email"
              placeholder="seu.email@hospital.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label className="login-label">Senha</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Options */}
          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" />
              Lembrar-me
            </label>
            <a href="#" className="login-forgot" onClick={e => e.preventDefault()}>
              Esqueci minha senha
            </a>
          </div>

          {/* Submit */}
          <button className="login-submit" type="submit">
            Entrar
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          Não possui conta? <a href="#" onClick={e => e.preventDefault()}>Solicitar acesso</a>
        </div>
      </div>
    </div>
  );
}
