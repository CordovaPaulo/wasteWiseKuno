"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('user'); // default to user
  
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we came from admin login
    const type = searchParams.get('type');
    if (type === 'admin') {
      setUserType('admin');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccess(true);
      }, 1500);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        {/* Logo and Header */}
        <div className={styles.logoContainer}>
          <img src="/images/wwlogo.png" alt="WasteWise Logo" className={styles.logo} />
          <h1 className={styles.title}>WasteWise</h1>
          <p className={styles.subtitle}>Smart waste management for a greener future</p>
        </div>

        <h2 className={styles.heading}>Forgot Password</h2>
        <p className={styles.description}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {!showSuccess ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={styles.input}
                required
                disabled={isLoading}
              />
            </div>
            
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>Email Sent!</h3>
            <p>If an account with this email exists, you will receive a password reset link shortly.</p>
            <Link 
              href={userType === 'admin' ? '/admin/adminlogin' : '/login'} 
              className={styles.backToLoginBtn}
            >
              Back to {userType === 'admin' ? 'Admin ' : ''}Login
            </Link>
          </div>
        )}
        
        {!showSuccess && (
          <div className={styles.backToLogin}>
            <p>Remember your password?</p>
            <div className={styles.loginLinks}>
              <Link href="/login" className={styles.loginLink}>
                User Login
              </Link>
              <span className={styles.separator}>|</span>
              <Link href="/admin/adminlogin" className={styles.loginLink}>
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}