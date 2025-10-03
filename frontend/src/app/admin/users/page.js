"use client";

import AdminNavBar from "../componentsadmin/adminNavBar";
import { useState, useEffect } from 'react';
import styles from './users.module.css';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Mock user data - replace with API call
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@email.com",
        role: "User",
        status: "Active",
        joinDate: "2024-01-15",
        lastLogin: "2024-10-02"
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@email.com",
        role: "User",
        status: "Active",
        joinDate: "2024-02-20",
        lastLogin: "2024-10-01"
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike.johnson@email.com",
        role: "User",
        status: "Suspended",
        joinDate: "2024-03-10",
        lastLogin: "2024-09-28"
      },
      {
        id: 4,
        name: "Sarah Wilson",
        email: "sarah.wilson@email.com",
        role: "User",
        status: "Banned",
        joinDate: "2024-01-05",
        lastLogin: "2024-09-20"
      },
      {
        id: 5,
        name: "Robert Brown",
        email: "robert.brown@email.com",
        role: "User",
        status: "Active",
        joinDate: "2024-04-12",
        lastLogin: "2024-10-03"
      }
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleActionClick = (action, user) => {
    setSelectedAction(action);
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleConfirmAction = () => {
    if (selectedAction && selectedUser) {
      // Update user status based on action
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          let newStatus = user.status;
          switch (selectedAction) {
            case 'suspend':
              newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
              break;
            case 'ban':
              newStatus = user.status === 'Banned' ? 'Active' : 'Banned';
              break;
            case 'delete':
              return null; // Will be filtered out
            default:
              break;
          }
          return { ...user, status: newStatus };
        }
        return user;
      }).filter(user => user !== null);

      setUsers(updatedUsers);
    }
    setShowModal(false);
    setSelectedAction(null);
    setSelectedUser(null);
  };

  const handleCancelAction = () => {
    setShowModal(false);
    setSelectedAction(null);
    setSelectedUser(null);
  };

  const getActionText = (action) => {
    switch (action) {
      case 'suspend':
        return selectedUser?.status === 'Suspended' ? 'Unsuspend' : 'Suspend';
      case 'ban':
        return selectedUser?.status === 'Banned' ? 'Unban' : 'Ban';
      case 'delete':
        return 'Delete';
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#10b981';
      case 'Suspended':
        return '#f59e0b';
      case 'Banned':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <>
      <AdminNavBar />
      <main className={styles.usersMain}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>User Management</h1>
          </div>

          <div className={styles.usersContainer}>
            <div className={styles.containerHeader}>
              <h2 className={styles.sectionTitle}>All Users</h2>
              <div className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                  <i className="fas fa-search" style={{ color: '#6b7280' }}></i>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={styles.userRow}>
                      <td className={styles.userCell}>
                        <div className={styles.userInfo}>
                          <div className={styles.userAvatar}>
                            <i className="fas fa-user"></i>
                          </div>
                          <div>
                            <div className={styles.userName}>{user.name}</div>
                            <div className={styles.userEmail}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.roleCell}>{user.role}</td>
                      <td className={styles.statusCell}>
                        <span 
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(user.status) }}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className={styles.dateCell}>{user.joinDate}</td>
                      <td className={styles.dateCell}>{user.lastLogin}</td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.actionBtn} ${styles.suspendBtn}`}
                            onClick={() => handleActionClick('suspend', user)}
                            title={user.status === 'Suspended' ? 'Unsuspend User' : 'Suspend User'}
                          >
                            <i className={user.status === 'Suspended' ? 'fas fa-play' : 'fas fa-pause'}></i>
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.banBtn}`}
                            onClick={() => handleActionClick('ban', user)}
                            title={user.status === 'Banned' ? 'Unban User' : 'Ban User'}
                          >
                            <i className={user.status === 'Banned' ? 'fas fa-unlock' : 'fas fa-ban'}></i>
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleActionClick('delete', user)}
                            title="Delete User"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className={styles.noUsers}>
                  <i className="fas fa-users" style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '1rem' }}></i>
                  <p>No users found</p>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Modal */}
          {showModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h3>Confirm Action</h3>
                  <button 
                    className={styles.closeBtn}
                    onClick={handleCancelAction}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <p>
                    Are you sure you want to <strong>{getActionText(selectedAction).toLowerCase()}</strong> the user <strong>{selectedUser?.name}</strong>?
                  </p>
                  {selectedAction === 'delete' && (
                    <p className={styles.warningText}>
                      <i className="fas fa-exclamation-triangle"></i>
                      This action cannot be undone.
                    </p>
                  )}
                </div>
                <div className={styles.modalFooter}>
                  <button 
                    className={styles.cancelBtn}
                    onClick={handleCancelAction}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`${styles.confirmBtn} ${selectedAction === 'delete' ? styles.deleteConfirm : ''}`}
                    onClick={handleConfirmAction}
                  >
                    {getActionText(selectedAction)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}