import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Calendar, Search, Settings, CalendarDaysIcon, Bell, User, Edit2, X, Check, Globe, MapPin, CheckSquare, Square, Filter } from 'lucide-react';
import './App.css';

const App = () => {
  const [allTodos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [tasksVisible, setTasksVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showMainTasks, setShowMainTasks] = useState(true);
  const [showScheduledTasks, setShowScheduledTasks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [profileName, setProfileName] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [tempName, setTempName] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [language, setLanguage] = useState('en');
  const [country, setCountry] = useState('US');
  const [tempLanguage, setTempLanguage] = useState('en');
  const [tempCountry, setTempCountry] = useState('US');
  const [editForm, setEditForm] = useState({
    title: '',
    time: '',
    category: ''
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
  ];

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'BR', name: 'Brazil' },
    { code: 'JP', name: 'Japan' },
    { code: 'IN', name: 'India'}
  ];

  const categoryColors = {
    important: '#87CEFA',
    personal: '#FF69B4',
    work: '#FFD700',
  };

  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    const savedName = localStorage.getItem('profileName') || '';
    const savedNotifications = localStorage.getItem('notifications') === 'true';
    const savedLanguage = localStorage.getItem('language') || 'en';
    const savedCountry = localStorage.getItem('country') || 'US';
    
    setTodos(savedTodos);
    setProfileName(savedName);
    setTempName(savedName);
    setNotifications(savedNotifications);
    setLanguage(savedLanguage);
    setTempLanguage(savedLanguage);
    setCountry(savedCountry);
    setTempCountry(savedCountry);
  }, []);

  const handleSaveSettings = () => {
    setProfileName(tempName);
    setLanguage(tempLanguage);
    setCountry(tempCountry);
    localStorage.setItem('profileName', tempName);
    localStorage.setItem('notifications', notifications);
    localStorage.setItem('language', tempLanguage);
    localStorage.setItem('country', tempCountry);
  };

  const notifyUser = (message) => {
    if (notifications && "Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Do-it Task Manager", {
            body: message,
            icon: "/path-to-your-icon.png"
          });
        }
      });
    }
  };

  const checkAndNotify = () => {
    if (!notifications) return;

    const now = new Date();
    const currentTime = now.getTime();

    allTodos.forEach(todo => {
      if (todo.completed) return; // Skip completed tasks
      
      const todoTime = new Date(todo.time).getTime();
      const timeDiff = todoTime - currentTime;
      
      if (timeDiff >= 0 && timeDiff <= 60000) {
        if ('Notification' in window) {
          if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                createNotification(todo);
              }
            });
          } else {
            createNotification(todo);
          }
        }
      }
    });
  };

  const createNotification = (todo) => {
    const notification = new Notification('Task Due!', {
      icon: '/favicon.ico',
      tag: todo.id,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  const getCategoryTasks = (category) => {
    return allTodos.filter((todo) => todo.category === category);
  };

  const handleAddTodo = () => {
    if (!newTitle || !newTime || !newCategory) return;

    const newTodo = {
      id: Date.now(),
      title: newTitle,
      time: newTime,
      category: newCategory.toLowerCase(),
      completed: false,
    };

    const updatedTodos = [...allTodos, newTodo];
    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    
    if (notifications) {
      notifyUser(`New task added: ${newTitle}`);
    }

    setNewTitle('');
    setNewTime('');
    setNewCategory('');
    setActiveCategory(newCategory.toLowerCase());
    setShowMainTasks(false);
    setShowScheduledTasks(false);
  };

  const handleToggleComplete = (id) => {
    const updatedTodos = allTodos.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
    );
    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    
    const completedTodo = updatedTodos.find(todo => todo.id === id);
    if (notifications) {
      notifyUser(`Task ${completedTodo.completed ? 'completed' : 'uncompleted'}: ${completedTodo.title}`);
    }
  };

  const handleEdit = (todo) => {
    setEditingTask(todo.id);
    setEditForm({
      title: todo.title,
      time: todo.time,
      category: todo.category
    });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditForm({
      title: '',
      time: '',
      category: ''
    });
  };

  const handleSaveEdit = (id) => {
    if (!editForm.title || !editForm.time || !editForm.category) return;

    const updatedTodos = allTodos.map(todo => 
      todo.id === id 
        ? { ...todo, ...editForm }
        : todo
    );

    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    
    if (notifications) {
      notifyUser(`Task updated: ${editForm.title}`);
    }

    setEditingTask(null);
    setEditForm({
      title: '',
      time: '',
      category: ''
    });
  };

  const handleDeleteTodo = (id) => {
    const updatedTodos = allTodos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    if (notifications) {
      notifyUser('Task deleted successfully');
    }
  };

  const toggleTasksVisibility = () => {
    setTasksVisible(!tasksVisible);
    setActiveCategory(null);
    setShowMainTasks(true);
    setShowScheduledTasks(false);
    setShowSettings(false);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setShowMainTasks(false);
    setShowScheduledTasks(false);
    setShowSettings(false);
  };

  const handleScheduledTasksClick = () => {
    setShowScheduledTasks(true);
    setShowMainTasks(false);
    setActiveCategory(null);
    setTasksVisible(false);
    setShowSettings(false);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
    setShowScheduledTasks(false);
    setShowMainTasks(false);
    setActiveCategory(null);
    setTasksVisible(false);
  };

  const getFilteredTasks = () => {
    let filtered = [...allTodos];
    
    if (searchQuery) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterDate) {
      filtered = filtered.filter(todo => {
        const todoDate = new Date(todo.time).toLocaleDateString();
        const filterDateObj = new Date(filterDate).toLocaleDateString();
        return todoDate === filterDateObj;
      });
    }

    if (filterCategory) {
      filtered = filtered.filter(todo => todo.category === filterCategory);
    }
    
    return filtered.sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  const displayedTasks = showScheduledTasks 
    ? getFilteredTasks()
    : activeCategory 
      ? getCategoryTasks(activeCategory)
      : allTodos;

  return (
    <div className="container">
      <div className="app">
        <div className="sidebar">
          <div className="menu-content">
            <h2>Do-it</h2>
            {profileName && (
              <div className="profile-info">
                <User size={16} className="inline-icon" />
                <span>{profileName}</span>
              </div>
            )}
            <nav>
              <ul>
                <li 
                  className={`clickable ${showMainTasks ? 'active' : ''}`}
                  onClick={toggleTasksVisibility}
                >
                  <CalendarDaysIcon className="inline-icon" size={16} />
                  Today tasks
                </li>
                {tasksVisible && (
                  <ul className="task-list">
                    {Object.entries(categoryColors).map(([category, color]) => (
                      <li
                        key={category}
                        className={`clickable ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(category)}
                      >
                        <span
                          className="dot"
                          style={{ backgroundColor: color }}
                        ></span>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                        <span className="task-count">
                          ({getCategoryTasks(category).length})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <li 
                  className={`clickable ${showScheduledTasks ? 'active' : ''}`}
                  onClick={handleScheduledTasksClick}
                >
                  <Calendar className="inline-icon" size={16} />
                  Scheduled tasks
                </li>
                <li 
                  className={`clickable ${showSettings ? 'active' : ''}`}
                  onClick={handleSettingsClick}
                >
                  <Settings className="inline-icon" size={16} />
                  Settings
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="main">
          <div className="app-container">
            {showSettings ? (
              <>
                <div className="header">
                  <span className="subtitle">Settings</span>
                  <h1 className="title">User Preferences</h1>
                </div>
                <div className="settings-container">
                  <div className="setting-section">
                    <label className="setting-label">
                      <User size={16} className="inline-icon" />
                      Profile Name
                    </label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="setting-input"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="setting-section">
                    <label className="setting-label">
                      <Globe size={16} className="inline-icon" />
                      Language
                    </label>
                    <select
                      value={tempLanguage}
                      onChange={(e) => setTempLanguage(e.target.value)}
                      className="setting-input"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="setting-section">
                    <label className="setting-label">
                      <MapPin size={16} className="inline-icon" />
                      Country
                    </label>
                    <select
                      value={tempCountry}
                      onChange={(e) => setTempCountry(e.target.value)}
                      className="setting-input"
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="setting-section">
                    <label className="setting-label">
                      <Bell size={16} className="inline-icon" />
                      Notifications
                    </label>
                    <div className="notification-toggle">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={notifications}
                          onChange={(e) => setNotifications(e.target.checked)}
                        />
                        <span className="slider round"></span>
                      </label>
                      <span className="toggle-label">
                        {notifications ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <button onClick={handleSaveSettings} className="save-button">
                    Save Changes
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="header">
                  <span className="subtitle">
                    {showScheduledTasks 
                      ? 'Scheduled Tasks'
                      : activeCategory 
                        ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Tasks`
                        : 'Today main focus'
                    }
                  </span>
                  <h1 className="title">
                    {showScheduledTasks
                      ? `${getFilteredTasks().length} scheduled tasks`
                      : activeCategory
                        ? `${getCategoryTasks(activeCategory).length} ${activeCategory} tasks`
                        : displayedTasks.length > 0
                        ? displayedTasks[0].title
                        : 'No tasks yet'
                    }
                  </h1>
                </div>

                {showScheduledTasks && (
                  <div className="filters-container">
                    <div className="search-box">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    <div className="filter-controls">
                      <div className="category-filter">
                        <Filter size={16} />
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="category-select"
                        >
                          <option value="">All Categories</option>
                          {Object.keys(categoryColors).map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="date-filter"
                      />
                    </div>
                  </div>
                )}

                {!showScheduledTasks && !activeCategory && (
                  <div className="input-container">
                    <input
                      type="text"
                      placeholder="What is your next task?"
                      className="task-input"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <input
                      type="datetime-local"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                    />
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      <option value="important">Important</option>
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                    </select>
                    <button onClick={handleAddTodo}>Add Task</button>
                  </div>
                )}

                <div className="tasks-container">
                  {displayedTasks.map((todo) => (
                    <div key={todo.id} className="task-item">
                      {editingTask === todo.id ? (
                        <div className="edit-form">
                          <div className="edit-inputs">
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                              className="edit-input"
                              placeholder="Task title"
                            />
                            <input
                              type="datetime-local"
                              value={editForm.time}
                              onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                              className="edit-input"
                            />
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                              className="edit-input"
                            >
                              <option value="">Select Category</option>
                              <option value="important">Important</option>
                              <option value="personal">Personal</option>
                              <option value="work">Work</option>
                            </select>
                          </div>
                          <div className="edit-actions">
                            <button 
                              className="save-btn"
                              onClick={() => handleSaveEdit(todo.id)}
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={handleCancelEdit}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="task-left">
                            <button 
                              onClick={() => handleToggleComplete(todo.id)}
                              className="complete-button"
                            >
                              {todo.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                            <div
                              className="task-dot"
                              style={{
                                backgroundColor: categoryColors[todo.category],
                              }}
                            ></div>
                            <span className={`task-title ${todo.completed ? 'completed' : ''}`}>
                              {todo.title}
                            </span>
                          </div>
                          <div className="task-right">
                            <span className="task-time">
                              {new Date(todo.time).toLocaleString(language)}
                            </span>
                            <Clock className="clock-icon" size={16} />
                            <Edit2
                              className="edit-icon"
                              size={16}
                              onClick={() => handleEdit(todo)}
                            />
                            <Trash2
                              className="delete-icon"
                              size={16}
                              onClick={() => handleDeleteTodo(todo.id)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
