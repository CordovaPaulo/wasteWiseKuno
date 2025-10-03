'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './adminlogin.module.css';
import TermsModal from '../../components/TermsModal';

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showTermsModal, setShowTermsModal] = useState(false);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('at least 1 uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('at least 1 number');
    if (!/[!@#$%^&*(),_.?":{}|<>]/.test(password)) errors.push('at least 1 special character');
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = `Password must include: ${passwordErrors.join(', ')}`;
      }
    }

    if (Object.keys(newErrors).length === 0) {
      // Successful sign in - redirect to admin dashboard
      router.push('/admin/adashboard');
    } else {
      setErrors(newErrors);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password?type=admin');
  };

  const handleTermsClick = () => {
    setShowTermsModal(true);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.logoContainer}>
            <img src="/images/wwlogo.png" alt="WasteWise Logo" className={styles.logo} />
            <h1 className={styles.title}>WasteWise</h1>
            <p className={styles.subtitle}>Smart waste management for a greener future</p>
          </div>

          <div className={`${styles.formContainer} ${styles.signInTab}`}>
            <h2 className={styles.formTitle}>Admin Sign In</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@gmail.com"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.inputError : ''}`}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'}></i>
                  </button>
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.forgotPassword}>
                <button
                  type="button"
                  className={styles.forgotPasswordLink}
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className={styles.submitButton}>
                Sign In
              </button>

              <div className={styles.termsNotice}>
                <span>By continuing, you agree to our </span>
                <button
                  type="button"
                  className={styles.termsLink}
                  onClick={handleTermsClick}
                >
                  Terms and Privacy Policy
                </button>
                <span>.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
      <TermsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </>
  );
}