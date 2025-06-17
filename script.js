  // Dream Tracker App JavaScript 
document.addEventListener('DOMContentLoaded', function () {
  // Always hide dashboard at first load
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('userDisplay').classList.add('hidden');
  document.getElementById('logoutBtn').classList.add('hidden');
  document.getElementById('openSettingsBtn').classList.add('hidden');
  document.getElementById('closeGoalModalBtn').addEventListener('click', closeGoalModal);
  document.getElementById('cancelGoal').addEventListener('click', closeGoalModal);
  document.getElementById('closeDailyGoals').addEventListener('click', () => {
  // Hide the daily goals popup
  document.getElementById('dailyGoalsModal').classList.add('hidden');
});
  initApp();
});

// At top of script.js, after your loadAppState() but before any updateXYZ functions:
const totalSavingsElem            = document.getElementById('totalSavings');
const totalGoalsElem              = document.getElementById('totalGoals');
const householdIncomeElem         = document.getElementById('householdIncome');
const householdMemberCountElem    = document.getElementById('householdMemberCount');
const netIncomeElem               = document.getElementById('netIncome');
const leftoverIncomeElem          = document.getElementById('leftoverIncome');
const dailyIncomeElem             = document.getElementById('dailyIncome');
const monthlyRecommendationElem   = document.getElementById('monthlyRecommendation');

    // App state (including settings, profilePic, expenses)
    const appState = {
      auth: {
        isLoggedIn: false,
        currentUser: null,
        users: []
      },
      household: {
        name: '',
        members: []
      },
      goals: [],           // savings goals
      savings: [],         // savings entries
      expenses: [],        // expense entries
      currentUser: null,
      theme: 'light',
      settings: {
        profilePic: ''    // Base64 string
      }
    };

function showAuthScreen() {
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('householdSetup').classList.add('hidden');
  document.getElementById('goalsSetup').classList.add('hidden');
  document.getElementById('userDisplay').classList.add('hidden');
  document.getElementById('logoutBtn').classList.add('hidden');
  document.getElementById('openSettingsBtn').classList.add('hidden');    // ← hide Settings
}

function showWelcomeScreen() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('welcomeScreen').classList.remove('hidden');
  document.getElementById('householdSetup').classList.add('hidden');
  document.getElementById('goalsSetup').classList.add('hidden');
}

function showHouseholdSetup() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('householdSetup').classList.remove('hidden');
  document.getElementById('goalsSetup').classList.add('hidden');
}

function showGoalsSetup() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('householdSetup').classList.add('hidden');
  document.getElementById('goalsSetup').classList.remove('hidden');
}

function showDashboard() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('householdSetup').classList.add('hidden');
  document.getElementById('goalsSetup').classList.add('hidden');
}

    // Expense category/subcategory mapping
    const expenseCategories = {
      Bills: ['Credit Card Bills', 'Electricity Bills', 'Mobile/DTH Bills', 'Wi-Fi Bill'],
      Rent: ['House Rent', 'Furniture Rent', 'Maintenance Fee'],
      Kitchen: ['Food', 'Vegetables & Grocery Bills'],
      Garage: ['Fuel', 'Other Expenses'],
      Travel: ['Hotel Bills', 'Travel Bills', 'Food Bills (Travel)'],
      Shopping: ['Shopping Bills'],
      Other: ['Miscellaneous Expenses']
    };

    // DOM Elements
    document.addEventListener('DOMContentLoaded', function () {
      initApp();
    });

function initApp() {
  // Load state
  const saved = localStorage.getItem('dreamTrackerApp');
  if (saved) {
    try {
      Object.assign(appState, JSON.parse(saved));
    } catch (e) {
      console.error('Corrupt app state, resetting…', e);
      localStorage.removeItem('dreamTrackerApp');
    }
  }

  // Always default all screens hidden (you probably already have these)
  showAuthScreen();
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('householdSetup').classList.add('hidden');
  document.getElementById('goalsSetup').classList.add('hidden');

  if (appState.auth.isLoggedIn) {
    // Once we have a logged‐in user, show the dashboard straight away
    applyProfileDisplay();
    showDashboard();
    updateDashboard();
  }
  
  // (rest of your initialization: date inputs, event-listeners, etc.)
}

      // Auth tab switching
      document.getElementById('signupTab').addEventListener('click', () => {
        document.getElementById('signupTab').classList.add('active');
        document.getElementById('loginTab').classList.remove('active');
        document.getElementById('signupForm').classList.remove('hidden');
        document.getElementById('loginForm').classList.add('hidden');
      });

      document.getElementById('loginTab').addEventListener('click', () => {
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('signupTab').classList.remove('active');
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
      });

      // Auth form submissions
      document.getElementById('userSignupForm').addEventListener('submit', handleSignup);
      document.getElementById('userLoginForm').addEventListener('submit', handleLogin);

      // Event listeners
      document.getElementById('getStartedBtn').addEventListener('click', () => {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('householdSetup').classList.remove('hidden');
      });

      document.getElementById('householdForm').addEventListener('submit', handleHouseholdFormSubmit);
      document.getElementById('addHouseholdMember').addEventListener('click', addHouseholdMemberField);
      document.getElementById('goalsForm').addEventListener('submit', handleGoalsFormSubmit);
      document.getElementById('addGoalBtn').addEventListener('click', addGoalField);

      document.getElementById('addSavingsBtn').addEventListener('click', openSavingsModal);
      document.getElementById('cancelSavings').addEventListener('click', closeSavingsModal);
      document.getElementById('addSavingsForm').addEventListener('submit', handleAddSavings);

      document.getElementById('addExpenseBtn').addEventListener('click', openExpenseModal);
      document.getElementById('cancelExpense').addEventListener('click', closeExpenseModal);
      document.getElementById('addExpenseForm').addEventListener('submit', handleAddExpense);

      document.getElementById('addNewGoalBtn').addEventListener('click', openGoalModal);
      document.getElementById('cancelGoal').addEventListener('click', closeGoalModal);
      document.getElementById('addGoalForm').addEventListener('submit', handleAddGoal);

      document.getElementById('manageMembersBtn').addEventListener('click', openMembersModal);
      document.getElementById('closeMembersModal').addEventListener('click', closeMembersModal);
      document.getElementById('addMemberForm').addEventListener('submit', handleAddMember);

      document.getElementById('closeGoalDetails').addEventListener('click', closeGoalDetailsModal);
      document.getElementById('editGoalBtn').addEventListener('click', handleEditGoal);
      document.getElementById('addGoalSavingsBtn').addEventListener('click', handleAddGoalSavings);

      // Tab switching for Recent Activity
      document.getElementById('tabSavings').addEventListener('click', () => {
        document.getElementById('tabSavings').classList.add('border-indigo-600', 'text-indigo-600');
        document.getElementById('tabExpenses').classList.remove('border-indigo-600', 'text-indigo-600');
        document.getElementById('savingsActivity').classList.remove('hidden');
        document.getElementById('expensesActivity').classList.add('hidden');
      });
      document.getElementById('tabExpenses').addEventListener('click', () => {
        document.getElementById('tabExpenses').classList.add('border-indigo-600', 'text-indigo-600');
        document.getElementById('tabSavings').classList.remove('border-indigo-600', 'text-indigo-600');
        document.getElementById('expensesActivity').classList.remove('hidden');
        document.getElementById('savingsActivity').classList.add('hidden');
      });

      // Expense category change
      document.getElementById('expenseCategory').addEventListener('change', handleExpenseCategoryChange);

      // Theme toggle
      document.getElementById('toggleTheme').addEventListener('click', toggleTheme);

      // Settings panel open/close
      document.getElementById('openSettingsBtn').addEventListener('click', openSettingsModal);
      document.getElementById('closeSettingsBtn').addEventListener('click', closeSettingsModal);
      document.getElementById('cancelSettings').addEventListener('click', closeSettingsModal);
      document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);

      // Profile pic change
      document.getElementById('changeProfilePicBtn').addEventListener('click', () => {
        document.getElementById('profilePicInput').click();
      });
      document.getElementById('profilePicInput').addEventListener('change', handleProfilePicUpload);

      // Logout buttons
      document.getElementById('logoutBtn').addEventListener('click', performLogout);
      document.getElementById('logoutInSettings').addEventListener('click', performLogout);

      // Forgot Password handlers
      document.getElementById('forgotPasswordBtn').addEventListener('click', openForgotModal);
      document.getElementById('closeForgotModal').addEventListener('click', closeForgotModal);
      document.getElementById('cancelForgot').addEventListener('click', closeForgotModal);
      document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);

      // If already logged in and household/goals exist, update display
      if (appState.auth.isLoggedIn && appState.household.name) {
        updateUserDisplay(appState.auth.currentUser.name);
      }

      // Start countdown timer interval
      setInterval(updateAllCountdowns, 1000);

    // Authentication functions
    function handleSignup(e) {
      e.preventDefault();

      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('signupConfirmPassword').value;
      const termsAgree = document.getElementById('termsAgree').checked;

      // Validation
      if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
      }

      if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
      }

      if (!termsAgree) {
        showNotification('You must agree to the Terms of Service', 'error');
        return;
      }

      // Check if email already exists
      const emailExists = appState.auth.users.some((user) => user.email === email);
      if (emailExists) {
        showNotification('Email already registered. Please log in.', 'error');
        return;
      }

      // Create new user
      const newUser = {
        id: generateId(),
        name,
        email,
        password // In a real app, this would be hashed
      };

      appState.auth.users.push(newUser);
      appState.auth.isLoggedIn = true;
      appState.auth.currentUser = newUser;

      // Save to localStorage
      saveAppState();

      // Update profile display
      applyProfileDisplay();

    showDashboard();
    updateDashboard();
    showNotification('Account created successfully! Welcome to Dream Tracker.');
    updateUserDisplay(newUser.name);

    if (signupSuccessful) {
    showDashboard(); // Or showWelcomeScreen() if you need setup first
  }  

    }

      async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Find user
    const user = appState.auth.users.find(
      u => u.email === email && u.password === password
    );
    if (!user) {
      showNotification('Invalid email or password', 'error');
      return;
    }

    // Log in
    appState.auth.isLoggedIn = true;
    appState.auth.currentUser = user;
    saveAppState();

    // Update UI
    applyProfileDisplay();
    updateDashboard();      // ensure all cards/stats are correct
    showDashboard();        // go straight to the dashboard
    showDailyGoalsModal();  // your new popup

    // Notify
    showNotification(`Welcome back, ${user.name}!`);
        // Update user display
        updateUserDisplay(user.name);
      
    if (loginSuccessful) {
      showDashboard(); // Or showWelcomeScreen() if needed
    }  

      }

function performLogout() {
  appState.auth.isLoggedIn = false;
  appState.auth.currentUser = null;
  saveAppState();
  showAuthScreen();
    }

    function applyProfileDisplay() {
      const imgEl = document.getElementById('profilePic');
      const initialEl = document.getElementById('avatarInitial');
      const previewEl = document.getElementById('settingsProfilePicPreview');
      const settingsInitialEl = document.getElementById('settingsAvatarInitial');

      if (appState.settings.profilePic) {
        imgEl.src = appState.settings.profilePic;
        imgEl.classList.remove('hidden');
        initialEl.classList.add('hidden');

        previewEl.src = appState.settings.profilePic;
        previewEl.classList.remove('hidden');
        settingsInitialEl.classList.add('hidden');
      } else {
        imgEl.classList.add('hidden');
        initialEl.classList.remove('hidden');
        initialEl.textContent = appState.auth.currentUser
          ? appState.auth.currentUser.name.charAt(0).toUpperCase()
          : 'G';
        settingsInitialEl.textContent = appState.auth.currentUser
          ? appState.auth.currentUser.name.charAt(0).toUpperCase()
          : 'G';
        settingsInitialEl.classList.remove('hidden');
        previewEl.classList.add('hidden');
      }

      // Show logout button
      document.getElementById('logoutBtn').classList.remove('hidden');
      // Show settings button once logged in
      document.getElementById('openSettingsBtn').classList.remove('hidden');
    }

    function updateUserDisplay(name) {
      document.getElementById('currentUserName').textContent = name;
      document.getElementById('userDisplay').classList.remove('hidden');
      // Update avatar initial if no picture
      const initialEl = document.getElementById('avatarInitial');
      if (!appState.settings.profilePic) {
        initialEl.textContent = name.charAt(0).toUpperCase();
      }
    }

    function showWelcomeScreen() {
      document.getElementById('authScreen').classList.add('hidden');
      document.getElementById('welcomeScreen').classList.remove('hidden');
      document.getElementById('householdSetup').classList.add('hidden');
      document.getElementById('goalsSetup').classList.add('hidden');
      document.getElementById('dashboard').classList.add('hidden');

      // Show current user in header
      if (appState.auth.currentUser) {
        updateUserDisplay(appState.auth.currentUser.name);
      }
    }

    // Helper functions
    function generateId() {
      return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      );
    }

    function formatNumber(number) {
      return number.toLocaleString('en-IN');
    }

    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-IN', options);
    }

    function formatRelativeDue(daysLeft) {
      if (daysLeft < 0) return 'Past due';
      if (daysLeft === 0) return 'Due Today';
      if (daysLeft === 1) return 'Due Tomorrow';
      if (daysLeft < 7) return `In ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
      if (daysLeft < 30) {
        const weeks = Math.ceil(daysLeft / 7);
        return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
      }
      const months = Math.ceil(daysLeft / 30);
      return `In ${months} month${months > 1 ? 's' : ''}`;
    }

    function saveAppState() {
      localStorage.setItem('dreamTrackerApp', JSON.stringify(appState));
    }

    function getCategoryDetails(category) {
      const categories = {
        home: {
          imgUrl: 'https://cdn-icons-png.flaticon.com/512/2163/2163350.png',
          colorClass: 'goal-card-home'
        },
        car: {
          imgUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097182.png',
          colorClass: 'goal-card-car'
        },
        electronics: {
          imgUrl: 'https://cdn-icons-png.flaticon.com/512/1261/1261106.png',
          colorClass: 'goal-card-electronics'
        },
        furniture: {
          imgUrl: 'https://cdn-icons-png.flaticon.com/512/2603/2603741.png',
          colorClass: 'goal-card-furniture'
        },
        other: {
          imgUrl: 'https://cdn-icons-png.flaticon.com/512/6833/6833470.png',
          colorClass: 'goal-card-other'
        }
      };
      return categories[category] || categories.other;
    }

    function getCategoryName(category) {
      const names = {
        home: 'Home/Property',
        car: 'Vehicle',
        electronics: 'Electronics',
        furniture: 'Furniture',
        other: 'Other'
      };
      return names[category] || 'Other';
    }

    function showNotification(message, type = 'success') {
      const notification = document.getElementById('notification');
      const notificationText = document.getElementById('notificationText');
      const notificationIcon = document.getElementById('notificationIcon');

      notificationText.textContent = message;

      if (type === 'error') {
        notificationIcon.innerHTML = `
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828774.png" alt="Error Icon" class="w-6 h-6 text-red-500"/>
        `;
      } else {
        notificationIcon.innerHTML = `
          <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Success Icon" class="w-6 h-6 text-green-500"/>
        `;
      }

      notification.classList.remove('translate-y-20', 'opacity-0');
      setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
      }, 3000);
    }

    function toggleTheme() {
      const body = document.body;
      if (appState.theme === 'light') {
        body.classList.add('dark-theme');
        appState.theme = 'dark';
      } else {
        body.classList.remove('dark-theme');
        appState.theme = 'light';
      }
      saveAppState();
    }

    // Forgot Password functions
    function openForgotModal() {
      document.getElementById('forgotPasswordModal').classList.remove('hidden');
      // Reset the form fields
      document.getElementById('forgotEmail').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmNewPassword').value = '';
      document.getElementById('newPasswordContainer').classList.add('hidden');
      document.getElementById('forgotSubmit').textContent = 'Next';
    }

    function closeForgotModal() {
      document.getElementById('forgotPasswordModal').classList.add('hidden');
    }

    function handleForgotPassword(e) {
      e.preventDefault();
      const emailInput = document.getElementById('forgotEmail');
      const email = emailInput.value.trim();
      const newPasswordInput = document.getElementById('newPassword');
      const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
      const newPassword = newPasswordInput.value;
      const confirmNewPassword = confirmNewPasswordInput.value;

      // Step 1: Check if we are still in "email" stage or "new password" stage
      if (document.getElementById('newPasswordContainer').classList.contains('hidden')) {
        // Stage 1: Validate email exists
        if (!email) {
          showNotification('Please enter your email address', 'error');
          return;
        }
        const user = appState.auth.users.find((u) => u.email === email);
        if (!user) {
          showNotification('Email not found. Please sign up first.', 'error');
          return;
        }
        // Show new password fields
        document.getElementById('newPasswordContainer').classList.remove('hidden');
        document.getElementById('forgotSubmit').textContent = 'Reset Password';
        return;
      } else {
        // Stage 2: Validate new passwords and update
        if (!newPassword || !confirmNewPassword) {
          showNotification('Please fill in both password fields', 'error');
          return;
        }
        if (newPassword.length < 6) {
          showNotification('Password must be at least 6 characters', 'error');
          return;
        }
        if (newPassword !== confirmNewPassword) {
          showNotification('Passwords do not match', 'error');
          return;
        }
        // Find user again and update password
        const userIndex = appState.auth.users.findIndex((u) => u.email === email);
        if (userIndex === -1) {
          showNotification('Unexpected error: user not found', 'error');
          return;
        }
        appState.auth.users[userIndex].password = newPassword;
        saveAppState();
        showNotification('Password has been reset. Please log in with your new password.');
        closeForgotModal();
      }
    }

    // Form submission handlers
    function handleHouseholdFormSubmit(e) {
      e.preventDefault();

      // Get form values
      appState.household.name = document.getElementById('householdName').value.trim();

      // Add primary member
      const primaryMember = {
        id: generateId(),
        name: document.getElementById('primaryMemberName').value.trim(),
        income: parseFloat(document.getElementById('primaryMemberIncome').value) || 0,
        isPrimary: true
      };

      appState.household.members = [primaryMember];
      appState.currentUser = primaryMember.id;

      // Get additional members
      const memberElements = document.querySelectorAll('.household-member');
      memberElements.forEach((element) => {
        const name = element.querySelector('.member-name').value.trim();
        const income = parseFloat(element.querySelector('.member-income').value) || 0;
        if (name) {
          appState.household.members.push({
            id: generateId(),
            name,
            income,
            isPrimary: false
          });
        }
      });

      // Save to localStorage
      saveAppState();

      // Show goals setup
      showGoalsSetup();
      document.getElementById('householdSetup').classList.add('hidden');
      document.getElementById('goalsSetup').classList.remove('hidden');

      // Update contributors in goal form
      updateGoalContributors();
    }

    function handleGoalsFormSubmit(e) {
      e.preventDefault();

      // Get goals from form
      appState.goals = [];
      const goalItems = document.querySelectorAll('.goal-item');

      goalItems.forEach((item) => {
        const category = item.querySelector('.goal-category').value;
        const name = item.querySelector('.goal-name').value.trim();
        const cost = parseFloat(item.querySelector('.goal-cost').value) || 0;
        const date = item.querySelector('.goal-date').value;
        const bankName = item.querySelector('.goal-bank').value.trim();

        // Get contributors
        const contributors = [];
        const contributorCheckboxes = item.querySelectorAll(
          '.goal-contributor-checkbox:checked'
        );
        contributorCheckboxes.forEach((checkbox) => {
          contributors.push(checkbox.value);
        });

        if (name && cost > 0 && date && contributors.length > 0 && bankName) {
          appState.goals.push({
            id: generateId(),
            category,
            name,
            cost,
            targetDate: date,
            bankName,
            contributors,
            currentSavings: 0
          });
        }
      });

      // Save to localStorage
      saveAppState();

      // Show dashboard
    showDashboard();
      updateDashboard();

      // Show success notification
      showNotification('Your savings goals have been created!');
    }

    function handleAddSavings(e) {
      e.preventDefault();

      const memberId = document.getElementById('savingsMember').value;
      const goalId = document.getElementById('savingsGoal').value;
      const amount = parseFloat(document.getElementById('savingsAmount').value) || 0;
      const date = document.getElementById('savingsDate').value;
      const notes = document.getElementById('savingsNotes').value.trim();

      if (memberId && goalId && amount > 0 && date) {
        // Add to savings history
        appState.savings.push({
          id: generateId(),
          memberId,
          goalId,
          amount,
          date,
          notes
        });

        // Update goal's current savings
        const goalIndex = appState.goals.findIndex((goal) => goal.id === goalId);
        if (goalIndex !== -1) {
          appState.goals[goalIndex].currentSavings += amount;
        }

        // Save to localStorage
        saveAppState();

        // Update UI
        updateDashboard();
        closeSavingsModal();

        // Reset form
        document.getElementById('savingsAmount').value = '';
        document.getElementById('savingsNotes').value = '';

        // Show success notification
        const goalName = appState.goals[goalIndex].name;
        showNotification(`₹${formatNumber(amount)} added to ${goalName}`);
      }
    }

    function handleAddExpense(e) {
      e.preventDefault();

      let category = document.getElementById('expenseCategory').value;
      let subcategory = document.getElementById('expenseSubcategory').value;
      const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
      const date = document.getElementById('expenseDate').value;
      const note = document.getElementById('expenseNote').value.trim();

      if (category === 'Custom') {
        const customCat = document.getElementById('customExpenseCategory').value.trim();
        const customSubcat = document.getElementById('customExpenseSubcategory').value.trim();
        if (customCat) category = customCat;
        if (customSubcat) subcategory = customSubcat;
      }

      if (category && subcategory && amount > 0 && date) {
        appState.expenses.push({
          id: generateId(),
          category,
          subcategory,
          amount,
          date,
          note
        });

        // Save to localStorage
        saveAppState();

        // Update UI
        updateDashboard();
        closeExpenseModal();

        // Reset form
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseNote').value = '';
        document.getElementById('expenseCategory').value = '';
        document.getElementById('expenseSubcategory').innerHTML = '<option value="">Select Subcategory</option>';
        document.getElementById('customExpenseCategoryContainer').classList.add('hidden');
        document.getElementById('customExpenseSubcategoryContainer').classList.add('hidden');

        // Show success notification
        showNotification(`₹${formatNumber(amount)} expense recorded under ${category} › ${subcategory}`);
      }
    }

    function handleExpenseCategoryChange() {
      const cat = document.getElementById('expenseCategory').value;
      const subcatSelect = document.getElementById('expenseSubcategory');
      subcatSelect.innerHTML = '<option value="">Select Subcategory</option>';

      if (cat === 'Custom') {
        document.getElementById('subCategoryContainer').classList.add('hidden');
        document.getElementById('customExpenseCategoryContainer').classList.remove('hidden');
        document.getElementById('customExpenseSubcategoryContainer').classList.remove('hidden');
      } else {
        document.getElementById('subCategoryContainer').classList.remove('hidden');
        document.getElementById('customExpenseCategoryContainer').classList.add('hidden');
        document.getElementById('customExpenseSubcategoryContainer').classList.add('hidden');
        if (expenseCategories[cat]) {
          expenseCategories[cat].forEach((sub) => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            subcatSelect.appendChild(opt);
          });
        }
      }
    }

function handleAddGoal(e) {
  e.preventDefault();

  // 1️⃣ Read the hidden edit-mode marker
  const editId = document.getElementById('modalEditGoalId').value;

  // 2️⃣ Grab all the form values
  const category = document.getElementById('modalGoalCategory').value;
  const name     = document.getElementById('modalGoalName').value.trim();
  const cost     = parseFloat(document.getElementById('modalGoalCost').value) || 0;
  const date     = document.getElementById('modalGoalDate').value;
  const bankName = document.getElementById('modalGoalBank').value.trim();

  // 3️⃣ Collect contributors
  const contributors = [];
  document.querySelectorAll('#modalGoalContributors input:checked')
    .forEach(cb => contributors.push(cb.value));

  // 4️⃣ Basic validation
  if (!category || !name || cost <= 0 || !date || !bankName || contributors.length === 0) {
    showNotification('Please fill in all fields and select at least one contributor', 'error');
    return;
  }

  if (editId) {
    // ─── UPDATE EXISTING GOAL ───
    const goal = appState.goals.find(g => g.id === editId);
    if (!goal) return;

    Object.assign(goal, {
      category,
      name,
      cost,
      targetDate: date,
      bankName,
      contributors
    });

    saveAppState();
    updateDashboard();
    closeGoalModal();
    showNotification(`Goal "${name}" updated!`);

    // reset edit marker
    document.getElementById('modalEditGoalId').value = '';
    return;
  }

  // ─── CREATE A NEW GOAL ───
  const newGoal = {
    id: generateId(),
    category,
    name,
    cost,
    targetDate: date,
    bankName,
    contributors,
    currentSavings: 0
  };
  appState.goals.push(newGoal);

  saveAppState();
  updateDashboard();
  closeGoalModal();

  // clear form
  document.getElementById('modalAddGoalForm').reset(); // or individually clear fields

  showNotification(`New goal "${name}" has been added!`);
}


    function handleAddMember(e) {
      e.preventDefault();

      const name = document.getElementById('newMemberName').value.trim();
      const income = parseFloat(document.getElementById('newMemberIncome').value) || 0;

      if (name) {
        appState.household.members.push({
          id: generateId(),
          name,
          income,
          isPrimary: false
        });

        // Save to localStorage
        saveAppState();

        // Update UI
        updateDashboard();
        updateMembersList();

        // Reset form
        document.getElementById('newMemberName').value = '';
        document.getElementById('newMemberIncome').value = '';

        // Show success notification
        showNotification(`${name} has been added to your household!`);
      }
    }

    function handleEditGoal() {
  // 1. Get the goal ID from the details modal
  const goalId = document
    .getElementById('goalDetailsModal')
    .getAttribute('data-goal-id');
  const goal = appState.goals.find(g => g.id === goalId);
  if (!goal) return;

  // 2. Populate the “Add/Edit Goal” modal fields
  document.getElementById('modalEditGoalId').value   = goal.id;
  document.getElementById('modalGoalCategory').value = goal.category;
  document.getElementById('modalGoalName').value     = goal.name;
  document.getElementById('modalGoalCost').value     = goal.cost;
  document.getElementById('modalGoalDate').value     = goal.targetDate;
  document.getElementById('modalGoalBank').value     = goal.bankName;

  // 3. Populate the contributor checkboxes
  const container = document.getElementById('modalGoalContributors');
  container.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.checked = goal.contributors.includes(cb.value);
  });

  // 4. Close details, open goal modal
  closeGoalDetailsModal();
  document.getElementById('goalModalTitle').textContent = 'Edit Goal';
  openGoalModal();
    }

    function handleAddGoalSavings() {
      const goalId = document.getElementById('goalDetailsModal').getAttribute('data-goal-id');
      if (goalId) {
        document.getElementById('savingsGoal').value = goalId;
        closeGoalDetailsModal();
        openSavingsModal();
        document.getElementById('goalModalTitle').textContent = 'Add New Goal';
      }
    }

    function removeMember(memberId) {
  // 1️⃣ Remove from household
  appState.household.members = appState.household.members.filter(
    member => member.id !== memberId
  );

  // 2️⃣ Also remove from any goal’s contributors
  appState.goals.forEach(goal => {
    goal.contributors = goal.contributors.filter(id => id !== memberId);
  });

  // 3️⃣ Persist & refresh UI
  saveAppState();
  updateDashboard();
  updateMembersList();

  // 4️⃣ Notify
  showNotification('Member removed (and unassigned from any goals).');
    }

    // Settings handlers
    function openSettingsModal() {
      // Populate profile picture preview/initial
      applyProfileDisplay();

      // Populate existing goals for editing
      const list = document.getElementById('settingsGoalsList');
      list.innerHTML = '';
      appState.goals.forEach((goal, idx) => {
        const goalDiv = document.createElement('div');
        goalDiv.className = 'border border-gray-200 rounded-lg p-3';
        goalDiv.innerHTML = `
          <p class="text-sm font-medium text-gray-700 mb-2">Goal ${idx + 1}: ${
          goal.name
        }</p>
          <div class="space-y-2">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
              <input
                type="text"
                class="settings-goal-bank input-field w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                data-goal-id="${goal.id}"
                value="${goal.bankName}"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Target Date</label>
              <input
                type="date"
                class="settings-goal-date input-field w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                data-goal-id="${goal.id}"
                value="${goal.targetDate}"
              />
            </div>
          </div>
        `;
        list.appendChild(goalDiv);
      });

      document.getElementById('settingsModal').classList.remove('hidden');
    }

    function closeSettingsModal() {
      document.getElementById('settingsModal').classList.add('hidden');
    }

    function handleSettingsSubmit(e) {
      e.preventDefault();

      // Profile pic already handled on upload
      // Update each goal’s bankName and targetDate from the inputs
      const bankInputs = document.querySelectorAll('.settings-goal-bank');
      bankInputs.forEach((input) => {
        const goalId = input.getAttribute('data-goal-id');
        const newBank = input.value.trim();
        const goal = appState.goals.find((g) => g.id === goalId);
        if (goal && newBank) {
          goal.bankName = newBank;
        }
      });

      const dateInputs = document.querySelectorAll('.settings-goal-date');
      dateInputs.forEach((input) => {
        const goalId = input.getAttribute('data-goal-id');
        const newDate = input.value;
        const goal = appState.goals.find((g) => g.id === goalId);
        if (goal && newDate) {
          goal.targetDate = newDate;
        }
      });

      // Save changes
      saveAppState();

      closeSettingsModal();
      showNotification('Settings saved successfully!');
      updateDashboard();
    }

    function handleProfilePicUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64 = e.target.result;
        appState.settings.profilePic = base64;
        saveAppState();
        applyProfileDisplay();
      };
      reader.readAsDataURL(file);
    }

    // UI update functions
    function showDashboard() {
      document.getElementById('authScreen').classList.add('hidden');
      document.getElementById('welcomeScreen').classList.add('hidden');
      document.getElementById('householdSetup').classList.add('hidden');
      document.getElementById('goalsSetup').classList.add('hidden');
      document.getElementById('dashboard').classList.remove('hidden');
      updateCurrentUser();
    }

    function updateCurrentUser() {
      if (appState.auth.currentUser) {
        updateUserDisplay(appState.auth.currentUser.name);
      }
    }

    function updateDashboard() {
      updateSummaryCards();
      updateNextGoalsDueCard();
      updateOverallStatus();
      updateOverallExpenses();
      updateGoalCards();
      updateActivityHistory();
      updateExpenseHistory();
      updateHouseholdMembersList();
    const householdIncome = appState.household.members.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = appState.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    renderIncomeExpensesPie(householdIncome, totalExpenses); 
    updateCharts();  
        }

  if (incomeExpensesPieChart) incomeExpensesPieChart.destroy();

  incomeExpensesPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ₹${value.toLocaleString()} (${pct}%)`;
            }
          }
        }
      }
    }
  });

    function updateSummaryCards() {  
  // 1) Compute your numbers
  const totalSavings    = appState.goals.reduce((sum,g) => sum + g.currentSavings, 0);
  const householdIncome = appState.household.members.reduce((sum,m) => sum + m.income, 0);
  const totalExpenses   = appState.expenses.reduce((sum,e) => sum + e.amount, 0);
  const netIncome       = householdIncome - totalExpenses;
  const dailyIncomeVal  = householdIncome > 0 ? (householdIncome / 30).toFixed(2) : 0;
  const monthlyRecVal   = (dailyIncomeVal * 30).toFixed(2);

  // 2) Update the DOM directly
  document.getElementById('totalSavings').textContent          = `₹${formatNumber(totalSavings)}`;
  document.getElementById('totalGoals').textContent            = `${appState.goals.length} goal${appState.goals.length !== 1 ? 's' : ''}`;
  document.getElementById('householdIncome').textContent       = `₹${formatNumber(householdIncome)}`;
  document.getElementById('householdMemberCount').textContent  = `${appState.household.members.length} member${appState.household.members.length !== 1 ? 's' : ''}`;
  document.getElementById('netIncome').textContent             = `₹${formatNumber(netIncome)}`;
  document.getElementById('leftoverIncome').textContent        = netIncome > 0
    ? `Leftover available for savings: ₹${formatNumber(netIncome)}`
    : 'Warning: Expenses exceed income!';
  document.getElementById('dailyIncome').textContent           = `₹${formatNumber(parseFloat(dailyIncomeVal))} / day`;
  document.getElementById('monthlyRecommendation').textContent = `Recommended: ₹${formatNumber(parseFloat(monthlyRecVal))} / month`;
}

    function updateNextGoalsDueCard() {
      const container = document.getElementById('nextGoalsContainer');
      container.innerHTML = '';

      if (appState.goals.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No goals yet.</p>';
        return;
      }

      // Sort goals by target date ascending
      const sortedGoals = [...appState.goals].sort(
        (a, b) => new Date(a.targetDate) - new Date(b.targetDate)
      );

      sortedGoals.forEach((goal) => {
        const today = new Date();
        const targetDate = new Date(goal.targetDate);
        const timeDiff = targetDate.getTime() - today.getTime();
        let daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (daysLeft < 0) daysLeft = -1;

        const relativeText = daysLeft < 0 ? 'Past due' : formatRelativeDue(daysLeft);
        const formattedDate = formatDate(goal.targetDate);

        const row = document.createElement('div');
        row.className = 'flex justify-between';
        row.innerHTML = `
          <span class="font-medium">${goal.name}</span>
          <span>${relativeText}</span>
          <span class="text-gray-500">${formattedDate}</span>
        `;
        container.appendChild(row);
      });
    }

    function updateOverallStatus() {
      // Calculate overall totals
      const totalCostAll = appState.goals.reduce((sum, goal) => sum + goal.cost, 0);
      const totalSavedSoFar = appState.goals.reduce((sum, goal) => sum + goal.currentSavings, 0);
      const totalRemainingAll = totalCostAll - totalSavedSoFar;

      document.getElementById('overallTotalCost').textContent = `₹${formatNumber(
        totalCostAll
      )}`;
      document.getElementById('overallSaved').textContent = `₹${formatNumber(totalSavedSoFar)}`;
      document.getElementById('overallRemaining').textContent = `₹${formatNumber(
        totalRemainingAll
      )}`;
    }

    function updateOverallExpenses() {
      const totalExpAmt = appState.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      // Count unique categories used
      const uniqueCats = [...new Set(appState.expenses.map((exp) => exp.category))].length;

      document.getElementById('overallExpenseAmount').textContent = `₹${formatNumber(
        totalExpAmt
      )}`;
      document.getElementById('expenseCategoriesCount').textContent = `${
        uniqueCats
      } categories`;
      document.getElementById('overallExpenseCats').textContent = `${uniqueCats}`;
      document.getElementById('totalExpenses').textContent = `₹${formatNumber(totalExpAmt)}`;
    }

function updateGoalCards() {
  const goalCards = document.getElementById('goalCards');
  goalCards.innerHTML = '';

  if (appState.goals.length === 0) {
    goalCards.innerHTML = `
      <div class="col-span-full text-center py-8 text-gray-500">
        No savings goals yet. Add your first goal to get started!
      </div>
    `;
    return;
  }

  appState.goals.forEach((goal) => {
    // ----- Achievability Logic Start -----
    const householdIncome = appState.household.members.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = appState.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netIncome = householdIncome - totalExpenses;

    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const timeDiff = targetDate.getTime() - today.getTime();
    let daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (daysLeft < 1) daysLeft = 1;

    const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
    const remainingAmount = goal.cost - goal.currentSavings;
    const monthlyRequiredForGoal = remainingAmount / monthsLeft;

    let canAchieveText = '';
    if (monthlyRequiredForGoal > netIncome) {
      canAchieveText = `<span class="text-xs text-red-600 font-semibold">Not enough leftover income! Need to save more per month to reach this goal on time.</span>`;
    } else {
      canAchieveText = `<span class="text-xs text-green-600 font-semibold">You can achieve this goal by the target date at your current income & expense level.</span>`;
    }
    // ----- Achievability Logic End -----

    // ---- Existing card calculations ----
    const progressPercentage = Math.min(100, ((goal.currentSavings / goal.cost) * 100).toFixed(1));
    const remainingGoal = goal.cost - goal.currentSavings;

    // Required daily/weekly/monthly savings
    const dailyRequired = (remainingGoal / daysLeft).toFixed(2);
    const weeklyRequired = (dailyRequired * 7).toFixed(2);
    const monthlyRequired = (dailyRequired * 30).toFixed(2);

    // Split among contributors
    const contribCount = goal.contributors.length;
    const dailySplit = contribCount > 0 ? (dailyRequired / contribCount).toFixed(2) : dailyRequired;
    const weeklySplit = contribCount > 0 ? (weeklyRequired / contribCount).toFixed(2) : weeklyRequired;
    const monthlySplit = contribCount > 0 ? (monthlyRequired / contribCount).toFixed(2) : monthlyRequired;

    const categoryName = getCategoryName(goal.category);
    const { imgUrl, colorClass } = getCategoryDetails(goal.category);

    // Contributor avatars
    const contributorElements = goal.contributors
      .map((contributorId) => {
        const member = appState.household.members.find((m) => m.id === contributorId);
        if (member) {
          return `<div class="contributor-avatar" title="${member.name}">${member.name.charAt(0)}</div>`;
        }
        return '';
      })
      .join('');

    // ---- Card HTML ----
    const card = document.createElement('div');
    card.className =
      `goal-card ${colorClass} bg-white rounded-xl shadow-md p-6 cursor-pointer relative`;
    card.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center">
          <img src="${imgUrl}" alt="${goal.category}" class="category-img mr-3" />
          <div>
            <h3 class="text-lg font-semibold text-gray-800">${goal.name}</h3>
            <p class="text-xs text-gray-500">${categoryName}</p>
            <p class="text-sm text-gray-500">Bank: ${goal.bankName}</p>
            <p class="text-sm text-gray-500">Target: ${formatDate(goal.targetDate)}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-gray-800">₹${formatNumber(goal.currentSavings)}</p>
          <p class="text-sm text-gray-500">of ₹${formatNumber(goal.cost)}</p>
        </div>
      </div>
      <div class="mb-4">
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div
            class="progress-bar bg-indigo-600 h-2.5 rounded-full"
            style="width: ${progressPercentage}%"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500">
          <span>${progressPercentage}%</span>
          <span>₹${formatNumber(remainingGoal)} left</span>
        </div>
      </div>
      <div class="mb-4 flex items-center space-x-2">
        ${contributorElements}
      </div>
      <div class="mt-4 text-sm text-gray-600 space-y-1">
        <p>
          <strong>Required:</strong> ₹${formatNumber(parseFloat(dailyRequired))} / day,
          ₹${formatNumber(parseFloat(weeklyRequired))} / week,
          ₹${formatNumber(parseFloat(monthlyRequired))} / month
        </p>
        <p>
          <strong>Split Each:</strong> ₹${formatNumber(parseFloat(dailySplit))} / day,
          ₹${formatNumber(parseFloat(weeklySplit))} / week,
          ₹${formatNumber(parseFloat(monthlySplit))} / month
        </p>
      </div>
      <div class="absolute top-4 right-4 text-xs text-gray-700">
        <span id="countdown-${goal.id}" class="font-mono"></span>
      </div>
      <div class="mt-2">${canAchieveText}</div>
    `;

    // Click on card to open details modal
    card.addEventListener('click', () => openGoalDetails(goal.id));

    goalCards.appendChild(card);
  });

  // Immediately update countdowns
  updateAllCountdowns();
}

    function updateAllCountdowns() {
      appState.goals.forEach((goal) => {
        const countdownEl = document.getElementById(`countdown-${goal.id}`);
        if (!countdownEl) return;
        const now = new Date().getTime();
        const target = new Date(goal.targetDate).getTime();
        const diff = target - now;

        if (diff <= 0) {
          countdownEl.textContent = 'Past due';
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      });
    }

    function updateActivityHistory() {
      const historyTbody = document.getElementById('activityHistorySavings');
      historyTbody.innerHTML = '';

      if (appState.savings.length === 0) {
        historyTbody.innerHTML = `
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colspan="4">
              No savings activity recorded yet
            </td>
          </tr>
        `;
        return;
      }

      // Sort by date descending
      const sortedSavings = [...appState.savings].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

        sortedSavings.forEach((entry) => {
        const member = appState.household.members.find((m) => m.id === entry.memberId);
        const goal = appState.goals.find((g) => g.id === entry.goalId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 ...">${formatDate(entry.date)}</td>
            <td class="px-6 py-4 ...">${member ? member.name : 'Unknown'}</td>
            <td class="px-6 py-4 ...">${goal ? goal.name : 'Unknown'}</td>
            <td class="px-6 py-4 ...">₹${formatNumber(entry.amount)}</td>
            <td class="px-6 py-4 ...">
            <button class="text-red-500 hover:text-red-700 delete-saving-btn" data-id="${entry.id}">Delete</button>
            </td>
        `;
        historyTbody.appendChild(tr);
        tr.querySelector('.delete-saving-btn').addEventListener('click', function () {
            deleteSavingsEntry(entry.id);
        });
        });
    }
function deleteExpenseEntry(id) {
  appState.expenses = appState.expenses.filter(e => e.id !== id);
  saveAppState();
  updateDashboard();
  showNotification("Expense entry deleted.");
}
    function updateExpenseHistory() {
      const historyTbody = document.getElementById('activityHistoryExpenses');
      historyTbody.innerHTML = '';

      if (appState.expenses.length === 0) {
        historyTbody.innerHTML = `
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colspan="4">
              No expenses recorded yet
            </td>
          </tr>
        `;
        return;
      }

      // Sort by date descending
      const sortedExpenses = [...appState.expenses].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

sortedExpenses.forEach((entry) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(entry.date)}</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.category}</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.subcategory}</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${formatNumber(entry.amount)}</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm">
      <button class="text-red-500 hover:text-red-700 delete-expense-btn" data-id="${entry.id}">Delete</button>
    </td>
  `;
  historyTbody.appendChild(tr);

  // Add delete handler
  tr.querySelector('.delete-expense-btn').addEventListener('click', function () {
    deleteExpenseEntry(entry.id);
  });
});
    }

    function updateHouseholdMembersList() {
      const membersList = document.getElementById('householdMembersList');
      membersList.innerHTML = '';

      if (appState.household.members.length === 0) {
        membersList.innerHTML = `
          <div class="col-span-full text-center py-8 text-gray-500">
            No members added yet.
          </div>
        `;
        return;
      }

      appState.household.members.forEach((member) => {
        const memberCard = document.createElement('div');
        memberCard.className =
          'bg-white rounded-xl shadow-md p-4 flex items-center justify-between';
        memberCard.innerHTML = `
          <div class="flex items-center space-x-4">
            <div class="contributor-avatar bg-green-500">${member.name.charAt(0)}</div>
            <div>
              <p class="text-gray-800 font-medium">${member.name}</p>
              <p class="text-gray-500 text-sm">₹${formatNumber(
                member.income
              )} / month</p>
            </div>
          </div>
        `;
        membersList.appendChild(memberCard);
      });
    }

    function updateMembersList() {
      const membersList = document.getElementById('membersList');
      membersList.innerHTML = '';

      if (appState.household.members.length === 0) {
        membersList.innerHTML = `<p class="text-gray-500">No members found.</p>`;
        return;
      }

      appState.household.members.forEach((member) => {
        const memberRow = document.createElement('div');
        memberRow.className = `flex justify-between items-center`;
        memberRow.innerHTML = `
          <div>
            <p class="text-gray-800 font-medium">${member.name}</p>
            <p class="text-gray-500 text-sm">₹${formatNumber(
              member.income
            )} / month</p>
          </div>
          <button class="text-red-500 hover:text-red-700" data-member-id="${
            member.id
          }">Remove</button>
        `;
        membersList.appendChild(memberRow);

        memberRow.querySelector('button').addEventListener('click', () => {
          removeMember(member.id);
        });
      });
    }

    function addHouseholdMemberField() {
      const container = document.getElementById('householdMembers');
      const index = container.querySelectorAll('.household-member').length + 1;

      const memberDiv = document.createElement('div');
      memberDiv.className = 'flex items-center space-x-4 household-member';

      memberDiv.innerHTML = `
        <div class="w-2/3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Member Name</label>
          <input
            type="text"
            class="member-name input-field w-full px-4 py-2 border rounded-lg focus:outline-none"
            placeholder="Enter member name"
          />
        </div>
        <div class="w-1/3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Income</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
            <input
              type="number"
              class="member-income input-field w-full pl-8 px-4 py-2 border rounded-lg focus:outline-none"
              placeholder="Income"
            />
          </div>
        </div>
      `;
      container.appendChild(memberDiv);
    }

    function updateGoalContributors() {
      // For each goal-item, populate contributors checkboxes
      const goalOptionsWrapper = document.querySelectorAll('.goal-contributors');
      goalOptionsWrapper.forEach((wrapper) => {
        wrapper.innerHTML = '';
        appState.household.members.forEach((member) => {
          const checkboxId = `contrib-${member.id}-${Math.random()
            .toString(36)
            .substring(2, 7)}`;
          const checkboxWrapper = document.createElement('div');
          checkboxWrapper.className = 'flex items-center space-x-2';
          checkboxWrapper.innerHTML = `
            <input
              type="checkbox"
              value="${member.id}"
              id="${checkboxId}"
              class="goal-contributor-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label for="${checkboxId}" class="text-sm text-gray-700">${member.name}</label>
          `;
          wrapper.appendChild(checkboxWrapper);
        });
      });
    }

    function addGoalField() {
      const goalsList = document.getElementById('goalsList');
      const goalCount = goalsList.querySelectorAll('.goal-item').length + 1;

      const goalDiv = document.createElement('div');
      goalDiv.className = 'goal-item border border-gray-200 rounded-lg p-4 relative';

      goalDiv.innerHTML = `
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-800">Goal #${goalCount}</h3>
          <button type="button" class="remove-goal">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1828/1828774.png"
              alt="Remove Goal"
              class="w-5 h-5"
            />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Item Category</label>
            <select
              class="goal-category input-field w-full px-4 py-2 border rounded-lg focus:outline-none"
              required
            >
              <option value="">Select a category</option>
              <option value="home">Home/Property</option>
              <option value="car">Vehicle</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              class="goal-name input-field w-full px-4 py-2 border rounded-lg focus:outline-none"
              placeholder="e.g., New Home, Car, TV, etc."
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
                >₹</span
              >
              <input
                type="number"
                class="goal-cost input-field w-full pl-8 px-4 py-2 border rounded-lg focus:outline-none"
                placeholder="Enter the total cost"
                required
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
            <input
              type="date"
              class="goal-date input-field w-full px-4 py-2 border rounded-lg focus:outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              class="goal-bank input-field w-full px-4 py-2 border rounded-lg focus:outline-none"
              placeholder="Bank where saving"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contributors</label>
            <div class="goal-contributors flex flex-wrap gap-2"></div>
          </div>
        </div>
      `;

      goalsList.appendChild(goalDiv);

      // Add functionality to remove this goal field
      const removeBtn = goalDiv.querySelector('.remove-goal');
      removeBtn.addEventListener('click', () => {
        goalDiv.remove();
        // Re-label remaining goals
        const remainingGoals = document.querySelectorAll('.goal-item');
        remainingGoals.forEach((item, idx) => {
          item.querySelector('h3').textContent = `Goal #${idx + 1}`;
        });
      });

      updateGoalContributors();
    }

    function openSavingsModal() {
      // Populate contributors dropdown
      const memberSelect = document.getElementById('savingsMember');
      memberSelect.innerHTML = '<option value="">Select Contributor</option>';
      appState.household.members.forEach((member) => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        memberSelect.appendChild(option);
      });

      // Populate goals dropdown
      const goalSelect = document.getElementById('savingsGoal');
      goalSelect.innerHTML = '<option value="">Select Goal</option>';
      appState.goals.forEach((goal) => {
        const option = document.createElement('option');
        option.value = goal.id;
        option.textContent = goal.name;
        goalSelect.appendChild(option);
      });

      document.getElementById('savingsModal').classList.remove('hidden');
    }

    function closeSavingsModal() {
      document.getElementById('savingsModal').classList.add('hidden');
    }

    function openExpenseModal() {
      // Reset form
      document.getElementById('addExpenseForm').reset();
      document.getElementById('expenseSubcategory').innerHTML = '<option value="">Select Subcategory</option>';
      document.getElementById('customExpenseCategoryContainer').classList.add('hidden');
      document.getElementById('customExpenseSubcategoryContainer').classList.add('hidden');
      document.getElementById('subCategoryContainer').classList.remove('hidden');

      document.getElementById('expenseModal').classList.remove('hidden');
    }

    function closeExpenseModal() {
      document.getElementById('expenseModal').classList.add('hidden');
    }

    function openGoalModal() {
      // Populate contributors checkboxes in modal
      const container = document.getElementById('modalGoalContributors');
      container.innerHTML = '';
      appState.household.members.forEach((member) => {
        const checkboxId = `modal-contrib-${member.id}-${Math.random()
          .toString(36)
          .substring(2, 7)}`;
        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-center space-x-2';
        wrapper.innerHTML = `
          <input
            type="checkbox"
            value="${member.id}"
            id="${checkboxId}"
            class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label for="${checkboxId}" class="text-gray-700">${member.name}</label>
        `;
        container.appendChild(wrapper);
      });

      document.getElementById('goalModal').classList.remove('hidden');
    }

    function closeGoalModal() {
      document.getElementById('goalModal').classList.add('hidden');
    }

    function openMembersModal() {
      updateMembersList();
      document.getElementById('membersModal').classList.remove('hidden');
    }

    function closeMembersModal() {
      document.getElementById('membersModal').classList.add('hidden');
    }

    function openGoalDetails(goalId) {
      const goal = appState.goals.find((g) => g.id === goalId);
      if (!goal) return;

      // Set modal goal id
      const modal = document.getElementById('goalDetailsModal');
      modal.setAttribute('data-goal-id', goalId);

      // Populate goal details
      document.getElementById('detailsGoalName').textContent = goal.name;
      document.getElementById('detailsGoalCategory').textContent = getCategoryName(
        goal.category
      );
      document.getElementById('detailsGoalCost').textContent = `₹${formatNumber(
        goal.cost
      )}`;
      document.getElementById('detailsGoalSavings').textContent = `₹${formatNumber(
        goal.currentSavings
      )}`;
      document.getElementById('detailsGoalDate').textContent = formatDate(goal.targetDate);
      document.getElementById('detailsGoalBank').textContent = goal.bankName;

      const percentage = Math.min(100, ((goal.currentSavings / goal.cost) * 100).toFixed(1));
      document.getElementById('detailsGoalPercentage').textContent = `${percentage}%`;
      const remaining = Math.max(0, goal.cost - goal.currentSavings);
      document.getElementById('detailsGoalRemaining').textContent = `₹${formatNumber(
        remaining
      )}`;
      document.getElementById('detailsGoalProgress').style.width = `${percentage}%`;

      // Contributors
      const contribContainer = document.getElementById('detailsGoalContributors');
      contribContainer.innerHTML = '';
      goal.contributors.forEach((contributorId) => {
        const member = appState.household.members.find((m) => m.id === contributorId);
        if (member) {
          const avatar = document.createElement('div');
          avatar.className = 'contributor-avatar';
          avatar.title = member.name;
          avatar.textContent = member.name.charAt(0);
          contribContainer.appendChild(avatar);
        }
      });

      // Savings history for that goal
      const historyBody = document.getElementById('detailsGoalHistory');
      historyBody.innerHTML = '';
      const goalSavings = appState.savings
        .filter((entry) => entry.goalId === goalId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (goalSavings.length === 0) {
        historyBody.innerHTML = `
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colspan="4">
              No savings recorded yet
            </td>
          </tr>
        `;
      } else {
        goalSavings.forEach((entry) => {
          const member = appState.household.members.find((m) => m.id === entry.memberId);
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(
              entry.date
            )}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
              member ? member.name : 'Unknown'
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${formatNumber(
              entry.amount
            )}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
              entry.notes || '-'
            }</td>
          `;
          historyBody.appendChild(tr);
        });
      }

      modal.classList.remove('hidden');
    }

    function closeGoalDetailsModal() {
      const modal = document.getElementById('goalDetailsModal');
      modal.removeAttribute('data-goal-id');
      modal.classList.add('hidden');
    }

function renderIncomeExpensesPie(income, expenses) {
  const leftover = Math.max(income - expenses, 0);
  const ctx = document.getElementById('incomeExpensesPie').getContext('2d');
  if (window.incomeExpensesPieChart) {
    window.incomeExpensesPieChart.destroy();
  }
  window.incomeExpensesPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expenses', 'Leftover'],
      datasets: [{
        data: [income, expenses, leftover],
        backgroundColor: ['#22c55e', '#f59e42', '#3b82f6'],
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      }
    }
  });

  // Custom legend
  const colors = ['#22c55e', '#f59e42', '#3b82f6'];
  const labels = ['Income', 'Expenses', 'Leftover'];
  const legendHtml = labels.map((label, i) =>
    `<span class="legend-item"><span class="legend-color" style="background:${colors[i]}"></span>${label}</span>`
  ).join('');
  document.getElementById('pieLegend').innerHTML = `<div class="chart-legend">${legendHtml}</div>`;
}

let monthlyExpensesChart = null;
let expenseCategoryChart = null;

function updateCharts() {
  renderMonthlyExpensesChart();
  renderExpenseCategoryChart();
}

function renderMonthlyExpensesChart() {
  // Prepare data: group expenses by month
  const monthlyTotals = {};
  appState.expenses.forEach(exp => {
    const month = new Date(exp.date);
    const label = month.toLocaleString('default', { month: 'short', year: '2-digit' }); // e.g., "Jun '25"
    monthlyTotals[label] = (monthlyTotals[label] || 0) + exp.amount;
  });

  // Sort by date
  const labels = Object.keys(monthlyTotals).sort((a, b) => {
    const [am, ay] = a.split(" ");
    const [bm, by] = b.split(" ");
    return new Date(`${am} 1 20${ay}`) - new Date(`${bm} 1 20${by}`);
  });
  const data = labels.map(label => monthlyTotals[label]);

  // Destroy previous chart if exists
  if (monthlyExpensesChart) monthlyExpensesChart.destroy();

  const ctx = document.getElementById('monthlyExpensesChart').getContext('2d');
  monthlyExpensesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Expenses',
        data,
        backgroundColor: '#f59e42',
        borderRadius: 10,
        maxBarThickness: 30,
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: value => `₹${value.toLocaleString()}` }
        }
      }
    }
  });
}

function renderExpenseCategoryChart() {
  // Prepare data: group expenses by category
  const catTotals = {};
  appState.expenses.forEach(exp => {
    catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount;
  });

  const labels = Object.keys(catTotals);
  const data = labels.map(label => catTotals[label]);

  // Destroy previous chart if exists
  if (expenseCategoryChart) expenseCategoryChart.destroy();

  const ctx = document.getElementById('expenseCategoryChart').getContext('2d');
  expenseCategoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#3b82f6', '#16a34a', '#f59e42', '#6366f1', '#f43f5e', '#fde68a', '#a21caf'
        ]
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ₹${value.toLocaleString()} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// DEBUG: Hide dashboard if not logged in!
if (!appState.auth.isLoggedIn) {
  document.getElementById('dashboard').classList.add('hidden');
}

// Calculate days left and per-day requirement
function calculateDailyRequirement(goal) {
  const today = new Date();
  const target = new Date(goal.targetDate);
  let daysLeft = Math.ceil((target - today) / (1000*60*60*24));
  daysLeft = daysLeft > 0 ? daysLeft : 1;
  const remaining = goal.cost - goal.currentSavings;
  return (remaining / daysLeft).toFixed(2);
}

// Build and show the modal
function showDailyGoalsModal() {
  const modal = document.getElementById('dailyGoalsModal');
  const container = modal.querySelector('div.overflow-x-auto');
  container.innerHTML = '';

  if (appState.goals.length === 0) {
    container.innerHTML = '<p class="text-gray-600">No active goals</p>';
  } else {
    appState.goals.forEach(goal => {
      const daily = calculateDailyRequirement(goal);
      const card = document.createElement('div');
      card.className = 'goal-card–popup snap-start';
      card.innerHTML = `
        <h4 class="font-semibold text-lg mb-2">${goal.name}</h4>
        <p class="text-sm text-gray-500 mb-1">${getCategoryName(goal.category)}</p>
        <p class="text-xl font-bold mb-2">₹${formatNumber(daily)} / day</p>
        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div class="bg-indigo-600 h-2 rounded-full" style="width:${Math.min(100, (goal.currentSavings/goal.cost)*100)}%"></div>
        </div>
        <p class="text-xs text-gray-500">${Math.min(100, ((goal.currentSavings/goal.cost)*100).toFixed(1))}% complete</p>
      `;
      container.appendChild(card);
    });
  }

  modal.classList.remove('hidden');
}

// Hook up close button
document.getElementById('closeDailyGoals').addEventListener('click', () => {
  document.getElementById('dailyGoalsModal').classList.add('hidden');
});

// Call this right after login/signup succeeds
function uponLoginSuccess() {
  // your existing post-login logic...
  applyProfileDisplay();
  updateDashboard();
  // now show daily goals
  showDailyGoalsModal();
}

// Replace calls to showDashboard() in your login/signup handlers with uponLoginSuccess()
function handleLogin(e) {
  // …validation…
  appState.auth.isLoggedIn = true;
  // …load state…
  saveAppState();
  uponLoginSuccess();
  showNotification(`Welcome back, ${user.name}!`);
}

function handleSignup(e) {
  // …after creating account…
  uponLoginSuccess();
  showNotification('Account created! Here are your goals.');
}
function applyProfileDisplay() {
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileAvatar = document.getElementById('profileAvatar');

  if (appState.auth.isLoggedIn) {
    profileName.textContent = appState.auth.user.name;
    profileEmail.textContent = appState.auth.user.email;
    profileAvatar.textContent = appState.auth.user.name.charAt(0).toUpperCase();
  } else {
    profileName.textContent = 'Guest';
    profileEmail.textContent = '';
    profileAvatar.textContent = 'G';
  }
}

    // Initial setup
    applyProfileDisplay();
    updateDashboard();
    updateHouseholdMembersList();
    updateMembersList();
    updateGoalContributors();
    updateGoalCards();
    updateActivityHistory();
    updateExpenseHistory();
    updateOverallSavings();
    updateOverallExpenses();

    // Update charts
    updateCharts();

   