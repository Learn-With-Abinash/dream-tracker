// script.js

// ------------------------------
// 1) App State & Persistence
// ------------------------------
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
  goals: [],       // savings goals
  savings: [],     // savings entries
  expenses: [],    // expense entries
  theme: 'light',
  settings: {
    profilePic: '' // Base64 string
  }
};

function saveAppState() {
  localStorage.setItem('dreamTrackerApp', JSON.stringify(appState));
}

// ------------------------------
// 2) Utility Functions
// ------------------------------
function generateId() {
  return (
    Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2)
  );
}

function formatNumber(number) {
  return Number(number).toLocaleString('en-IN');
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

function formatRelativeDue(daysLeft) {
  if (daysLeft < 0)   return 'Past due';
  if (daysLeft === 0) return 'Due Today';
  if (daysLeft === 1) return 'Due Tomorrow';
  if (daysLeft < 7)   return `In ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
  if (daysLeft < 30) {
    const w = Math.ceil(daysLeft/7);
    return `In ${w} week${w>1?'s':''}`;
  }
  const m = Math.ceil(daysLeft/30);
  return `In ${m} month${m>1?'s':''}`;
}

// ------------------------------
// 3) Screen Management
// ------------------------------
function showAuthScreen() {
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('householdSetup').classList.add('hidden');
  document.getElementById('goalsSetup').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('openSettingsBtn').classList.add('hidden');
}

function showWelcomeScreen() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('welcomeScreen').classList.remove('hidden');
  document.getElementById('householdSetup').classList.add('hidden');
  document.getElementById('goalsSetup').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showHouseholdSetup() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('householdSetup').classList.remove('hidden');
  document.getElementById('goalsSetup').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showGoalsSetup() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('householdSetup').classList.add('hidden');
  document.getElementById('goalsSetup').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('householdSetup').classList.add('hidden');
  document.getElementById('goalsSetup').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('openSettingsBtn').classList.remove('hidden');
}

// ------------------------------
// 4) Profile & Theme
// ------------------------------
function applyProfileDisplay() {
  const imgEl = document.getElementById('profilePic');
  const initEl = document.getElementById('avatarInitial');
  if (appState.settings.profilePic) {
    imgEl.src = appState.settings.profilePic;
    imgEl.classList.remove('hidden');
    initEl.classList.add('hidden');
  } else {
    imgEl.classList.add('hidden');
    initEl.classList.remove('hidden');
    initEl.textContent = appState.auth.currentUser
      ? appState.auth.currentUser.name.charAt(0).toUpperCase()
      : 'G';
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  appState.theme = appState.theme === 'light' ? 'dark' : 'light';
  saveAppState();
}

// ------------------------------
// 5) Notifications
// ------------------------------
function showNotification(message, type = 'success') {
  const notif = document.getElementById('notification');
  const icon  = document.getElementById('notificationIcon');
  document.getElementById('notificationText').textContent = message;

  icon.innerHTML = type === 'error'
    ? `<img src="https://cdn-icons-png.flaticon.com/512/1828/1828774.png" class="w-6 h-6 text-red-500"/>`
    : `<img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" class="w-6 h-6 text-green-500"/>`;

  notif.classList.remove('translate-y-20','opacity-0');
  setTimeout(() => notif.classList.add('translate-y-20','opacity-0'), 3000);
}

// ------------------------------
// 6) Initialization (boot)
// ------------------------------
function initApp() {
  // Load saved state
  const saved = localStorage.getItem('dreamTrackerApp');
  if (saved) {
    try {
      Object.assign(appState, JSON.parse(saved));
    } catch {
      localStorage.removeItem('dreamTrackerApp');
    }
  }

  // Default-hide everything
  showAuthScreen();

  // Set up event bindings
  document.getElementById('signupTab').onclick = () => {
    document.getElementById('signupTab').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
  };
  document.getElementById('loginTab').onclick = () => {
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('signupTab').classList.remove('active');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
  };

  // Auth forms
  document.getElementById('userSignupForm').addEventListener('submit', handleSignup);
  document.getElementById('userLoginForm').addEventListener('submit', handleLogin);

  // Get Started button
  document.getElementById('getStartedBtn').onclick = () => {
    showHouseholdSetup();
  };

  // Household setup
  document.getElementById('householdForm').addEventListener('submit', handleHouseholdFormSubmit);
  document.getElementById('addHouseholdMember').onclick = addHouseholdMemberField;

  // Goals setup
  document.getElementById('goalsForm').addEventListener('submit', handleGoalsFormSubmit);
  document.getElementById('addGoalBtn').onclick = addGoalField;

  // Savings modal
  document.getElementById('addSavingsBtn').onclick = openSavingsModal;
  document.getElementById('cancelSavings').onclick = closeSavingsModal;
  document.getElementById('addSavingsForm').addEventListener('submit', handleAddSavings);

  // Expense modal
  document.getElementById('addExpenseBtn').onclick = openExpenseModal;
  document.getElementById('cancelExpense').onclick = closeExpenseModal;
  document.getElementById('addExpenseForm').addEventListener('submit', handleAddExpense);

  // Recent Activity tabs
  document.getElementById('tabSavings').onclick = () => {
    document.getElementById('savingsActivity').classList.remove('hidden');
    document.getElementById('expensesActivity').classList.add('hidden');
  };
  document.getElementById('tabExpenses').onclick = () => {
    document.getElementById('expensesActivity').classList.remove('hidden');
    document.getElementById('savingsActivity').classList.add('hidden');
  };

  // Expense category → subcategory
  document.getElementById('expenseCategory')
    .addEventListener('change', handleExpenseCategoryChange);

  // Theme toggle
  document.getElementById('toggleTheme').onclick = toggleTheme;

  // Settings modal
  document.getElementById('openSettingsBtn').onclick = openSettingsModal;
  document.getElementById('closeSettingsBtn').onclick = closeSettingsModal;
  document.getElementById('cancelSettings').onclick = closeSettingsModal;
  document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);

  // Profile pic upload
  document.getElementById('changeProfilePicBtn').onclick = () => {
    document.getElementById('profilePicInput').click();
  };
  document.getElementById('profilePicInput')
    .addEventListener('change', handleProfilePicUpload);

  // Logout
  document.getElementById('logoutBtn').onclick = performLogout;
  document.getElementById('logoutInSettings').onclick = performLogout;

  // Forgot password flow
  document.getElementById('forgotPasswordBtn').onclick = openForgotModal;
  document.getElementById('closeForgotModal').onclick = closeForgotModal;
  document.getElementById('cancelForgot').onclick = closeForgotModal;
  document.getElementById('forgotPasswordForm')
    .addEventListener('submit', handleForgotPassword);

  // Set today’s date default
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(i => i.value = today);

  // If already logged in
  if (appState.auth.isLoggedIn) {
    applyProfileDisplay();
    showDashboard();
    updateDashboard();
    showDailyGoalsModal();
  }

  // Start countdown updater
  setInterval(updateAllCountdowns, 1000);
}

document.addEventListener('DOMContentLoaded', initApp);

// ------------------------------
// 7) Authentication Handlers
// ------------------------------
function handleSignup(e) {
  e.preventDefault();
  const name  = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pwd   = document.getElementById('signupPassword').value;
  const cpwd  = document.getElementById('signupConfirmPassword').value;
  const terms = document.getElementById('termsAgree').checked;

  if (!name||!email||!pwd||!cpwd||pwd!==cpwd||pwd.length<6||!terms) {
    showNotification('Please complete the form correctly','error');
    return;
  }
  if (appState.auth.users.some(u=>u.email===email)) {
    showNotification('Email already registered','error');
    return;
  }

  const user = { id: generateId(), name, email, password: pwd };
  appState.auth.users.push(user);
  appState.auth.isLoggedIn = true;
  appState.auth.currentUser = user;
  saveAppState();

  applyProfileDisplay();
  uponLoginSuccess();
  showNotification('Account created! Welcome.');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pwd   = document.getElementById('loginPassword').value;
  const user  = appState.auth.users.find(u=>u.email===email&&u.password===pwd);

  if (!user) {
    showNotification('Invalid email or password','error');
    return;
  }

  appState.auth.isLoggedIn = true;
  appState.auth.currentUser = user;
  saveAppState();

  applyProfileDisplay();
  uponLoginSuccess();
  showNotification(`Welcome back, ${user.name}!`);
}

function performLogout() {
  appState.auth.isLoggedIn = false;
  appState.auth.currentUser = null;
  saveAppState();
  showAuthScreen();
}

// Called by both login and signup
function uponLoginSuccess() {
  showDashboard();
  updateDashboard();
  showDailyGoalsModal();
}

// ------------------------------
// 8) Household & Goals Setup
// ------------------------------
function handleHouseholdFormSubmit(e) {
  e.preventDefault();
  appState.household.name = document.getElementById('householdName').value.trim();

  // Primary member
  const primary = {
    id: generateId(),
    name: document.getElementById('primaryMemberName').value.trim(),
    income: parseFloat(document.getElementById('primaryMemberIncome').value)||0,
    isPrimary: true
  };
  appState.household.members = [primary];

  // Additional members
  document.querySelectorAll('.household-member').forEach(el => {
    const nm = el.querySelector('.member-name').value.trim();
    const inc= parseFloat(el.querySelector('.member-income').value)||0;
    if (nm) {
      appState.household.members.push({ id: generateId(), name: nm, income: inc, isPrimary: false });
    }
  });

  saveAppState();
  showGoalsSetup();
  updateGoalContributors();
}

function addHouseholdMemberField() {
  const container = document.getElementById('householdMembers');
  const div = document.createElement('div');
  div.className = 'flex space-x-4 household-member';
  div.innerHTML = `
    <input type="text" class="member-name input-field flex-1" placeholder="Name" />
    <input type="number" class="member-income input-field w-24" placeholder="₹" />
  `;
  container.appendChild(div);
}

function handleGoalsFormSubmit(e) {
  e.preventDefault();
  appState.goals = [];

  document.querySelectorAll('.goal-item').forEach(item => {
    const cat = item.querySelector('.goal-category').value;
    const nm  = item.querySelector('.goal-name').value.trim();
    const cost= parseFloat(item.querySelector('.goal-cost').value)||0;
    const dt  = item.querySelector('.goal-date').value;
    const bank= item.querySelector('.goal-bank').value.trim();
    const contrib = Array.from(item.querySelectorAll('.goal-contributor-checkbox:checked'))
                         .map(cb => cb.value);

    if (cat&&nm&&cost>0&&dt&&bank&&contrib.length) {
      appState.goals.push({
        id: generateId(),
        category: cat,
        name: nm,
        cost,
        targetDate: dt,
        bankName: bank,
        contributors: contrib,
        currentSavings: 0
      });
    }
  });

  saveAppState();
  showDashboard();
  updateDashboard();
  showNotification('Your savings goals have been created!');
}

function addGoalField() {
  const list = document.getElementById('goalsList');
  const idx  = list.children.length + 1;
  const div  = document.createElement('div');
  div.className = 'goal-item border border-gray-200 rounded-lg p-4 relative';
  div.innerHTML = `
    <h3 class="text-lg font-medium">
      Goal #${idx}
      <button class="remove-goal absolute top-2 right-2 text-gray-500">
        &times;
      </button>
    </h3>
    <div class="space-y-2">
      <select class="goal-category input-field w-full" required>
        <option value="">Select a category</option>
        <option value="home">Home/Property</option>
        <option value="car">Vehicle</option>
        <option value="electronics">Electronics</option>
        <option value="furniture">Furniture</option>
        <option value="other">Other</option>
      </select>
      <input type="text" class="goal-name input-field w-full" placeholder="Item Name" required/>
      <div class="relative">
        <span class="absolute inset-y-0 left-0 pl-3 text-gray-500">₹</span>
        <input type="number" class="goal-cost input-field pl-8 w-full" placeholder="Total Cost" required/>
      </div>
      <input type="date" class="goal-date input-field w-full" required/>
      <input type="text" class="goal-bank input-field w-full" placeholder="Bank Name" required/>
      <div class="goal-contributors flex flex-wrap gap-2"></div>
    </div>
  `;
  list.appendChild(div);

  // Remove goal button
  div.querySelector('.remove-goal').onclick = () => {
    div.remove();
    document.querySelectorAll('.goal-item').forEach((g,i) => {
      g.querySelector('h3').firstChild.textContent = `Goal #${i+1}`;
    });
  };

  updateGoalContributors();
}

function updateGoalContributors() {
  document.querySelectorAll('.goal-contributors').forEach(wrapper => {
    wrapper.innerHTML = '';
    appState.household.members.forEach(member => {
      const id = `cb-${member.id}-${Math.random().toString(36).slice(2,7)}`;
      const div = document.createElement('div');
      div.className = 'flex items-center space-x-1';
      div.innerHTML = `
        <input type="checkbox" id="${id}" value="${member.id}" class="goal-contributor-checkbox"/>
        <label for="${id}" class="text-sm">${member.name}</label>
      `;
      wrapper.appendChild(div);
    });
  });
}

// ------------------------------
// 9) Savings Handlers
// ------------------------------
function openSavingsModal() {
  const m = document.getElementById('savingsModal');
  // populate contributors & goals
  document.getElementById('savingsMember').innerHTML =
    appState.household.members.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');
  document.getElementById('savingsGoal').innerHTML =
    appState.goals.map(g=>`<option value="${g.id}">${g.name}</option>`).join('');
  m.classList.remove('hidden');
}

function closeSavingsModal() {
  document.getElementById('savingsModal').classList.add('hidden');
}

function handleAddSavings(e) {
  e.preventDefault();
  const memberId = document.getElementById('savingsMember').value;
  const goalId   = document.getElementById('savingsGoal').value;
  const amt      = parseFloat(document.getElementById('savingsAmount').value)||0;
  const date     = document.getElementById('savingsDate').value;
  const notes    = document.getElementById('savingsNotes').value.trim();

  if (memberId && goalId && amt>0 && date) {
    appState.savings.push({ id: generateId(), memberId, goalId, amount:amt, date, notes });
    const goal = appState.goals.find(g=>g.id===goalId);
    goal.currentSavings += amt;
    saveAppState();
    updateDashboard();
    closeSavingsModal();
    showNotification(`₹${formatNumber(amt)} added to ${goal.name}`);
  }
}

// ------------------------------
// 10) Expense Handlers
// ------------------------------
const expenseCategories = {
  Bills:['Credit Card Bills','Electricity Bills','Mobile/DTH Bills','Wi-Fi Bill'],
  Rent:['House Rent','Furniture Rent','Maintenance Fee'],
  Kitchen:['Food','Vegetables & Grocery Bills'],
  Garage:['Fuel','Other Expenses'],
  Travel:['Hotel Bills','Travel Bills','Food Bills (Travel)'],
  Shopping:['Shopping Bills'],
  Other:['Miscellaneous Expenses']
};

function openExpenseModal() {
  const m = document.getElementById('expenseModal');
  m.querySelector('#expenseCategory').value = '';
  m.querySelector('#expenseSubcategory').innerHTML = '<option value="">Select Subcategory</option>';
  document.getElementById('customExpenseCategoryContainer').classList.add('hidden');
  document.getElementById('customExpenseSubcategoryContainer').classList.add('hidden');
  m.classList.remove('hidden');
}

function closeExpenseModal() {
  document.getElementById('expenseModal').classList.add('hidden');
}

function handleExpenseCategoryChange() {
  const cat = document.getElementById('expenseCategory').value;
  const sub = document.getElementById('expenseSubcategory');
  sub.innerHTML = '<option value="">Select Subcategory</option>';

  if (cat === 'Custom') {
    document.getElementById('subCategoryContainer').classList.add('hidden');
    document.getElementById('customExpenseCategoryContainer').classList.remove('hidden');
    document.getElementById('customExpenseSubcategoryContainer').classList.remove('hidden');
  } else {
    document.getElementById('subCategoryContainer').classList.remove('hidden');
    document.getElementById('customExpenseCategoryContainer').classList.add('hidden');
    document.getElementById('customExpenseSubcategoryContainer').classList.add('hidden');
    (expenseCategories[cat]||[]).forEach(sc => {
      const opt = document.createElement('option');
      opt.value = sc;
      opt.textContent = sc;
      sub.appendChild(opt);
    });
  }
}

function handleAddExpense(e) {
  e.preventDefault();
  let cat = document.getElementById('expenseCategory').value;
  let sub = document.getElementById('expenseSubcategory').value;
  const amt  = parseFloat(document.getElementById('expenseAmount').value)||0;
  const date = document.getElementById('expenseDate').value;
  const note = document.getElementById('expenseNote').value.trim();

  if (cat === 'Custom') {
    const cc = document.getElementById('customExpenseCategory').value.trim();
    const cs = document.getElementById('customExpenseSubcategory').value.trim();
    if (cc) cat = cc;
    if (cs) sub = cs;
  }

  if (cat && sub && amt>0 && date) {
    appState.expenses.push({ id: generateId(), category:cat, subcategory:sub, amount:amt, date, note });
    saveAppState();
    updateDashboard();
    closeExpenseModal();
    showNotification(`₹${formatNumber(amt)} expense under ${cat} › ${sub}`);
  }
}

// ------------------------------
// 11) Add/Edit Goal Modal
// ------------------------------
function openGoalModal() {
  const m = document.getElementById('goalModal');
  // Populate contributors
  const cont = document.getElementById('modalGoalContributors');
  cont.innerHTML = '';
  appState.household.members.forEach(mem => {
    const id = `md-${mem.id}-${Math.random().toString(36).slice(2,7)}`;
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `
      <input type="checkbox" id="${id}" value="${mem.id}" class="h-4 w-4"/>
      <label for="${id}">${mem.name}</label>
    `;
    cont.appendChild(div);
  });
  m.classList.remove('hidden');
}

function closeGoalModal() {
  document.getElementById('goalModal').classList.add('hidden');
}

function handleAddGoal(e) {
  e.preventDefault();
  const cat = document.getElementById('modalGoalCategory').value;
  const nm  = document.getElementById('modalGoalName').value.trim();
  const cost= parseFloat(document.getElementById('modalGoalCost').value)||0;
  const dt  = document.getElementById('modalGoalDate').value;
  const bank= document.getElementById('modalGoalBank').value.trim();
  const contrib = Array.from(
    document.querySelectorAll('#modalGoalContributors input:checked')
  ).map(cb=>cb.value);

  if (cat&&nm&&cost>0&&dt&&bank&&contrib.length) {
    appState.goals.push({
      id: generateId(),
      category:cat, name:nm, cost,
      targetDate:dt, bankName:bank,
      contributors:contrib,
      currentSavings:0
    });
    saveAppState();
    updateDashboard();
    closeGoalModal();
    showNotification(`New goal "${nm}" added!`);
  }
}

function handleEditGoal() {
  closeGoalModal();
  showNotification('Goal editing coming soon','error');
}

function handleAddGoalSavings() {
  const gid = document.getElementById('goalDetailsModal').dataset.goalId;
  if (gid) {
    document.getElementById('savingsGoal').value = gid;
    closeGoalDetailsModal();
    openSavingsModal();
  }
}

// ------------------------------
// 12) Manage Members Modal
// ------------------------------
function openMembersModal() {
  updateMembersList();
  document.getElementById('membersModal').classList.remove('hidden');
}
function closeMembersModal() {
  document.getElementById('membersModal').classList.add('hidden');
}
function handleAddMember(e) {
  e.preventDefault();
  const nm = document.getElementById('newMemberName').value.trim();
  const inc= parseFloat(document.getElementById('newMemberIncome').value)||0;
  if (nm) {
    appState.household.members.push({ id:generateId(), name:nm, income:inc, isPrimary:false });
    saveAppState();
    updateDashboard();
    updateMembersList();
    showNotification(`${nm} added to household.`);
    document.getElementById('newMemberName').value = '';
    document.getElementById('newMemberIncome').value = '';
  }
}
function removeMember(memberId) {
  // Always allow removal now
  appState.household.members = appState.household.members.filter(m=>m.id!==memberId);
  appState.goals.forEach(g=> {
    g.contributors = g.contributors.filter(id=>id!==memberId);
  });
  saveAppState();
  updateDashboard();
  updateMembersList();
  showNotification('Member removed');
}
function updateMembersList() {
  const list = document.getElementById('membersList');
  list.innerHTML = '';
  appState.household.members.forEach(mem => {
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center';
    div.innerHTML = `
      <div>
        <p class="font-medium">${mem.name}</p>
        <p class="text-sm">₹${formatNumber(mem.income)} / month</p>
      </div>
      <button class="text-red-500" data-id="${mem.id}">Remove</button>
    `;
    list.appendChild(div);
    div.querySelector('button').onclick = () => removeMember(mem.id);
  });
}

// ------------------------------
// 13) Settings Modal
// ------------------------------
function openSettingsModal() {
  applyProfileDisplay();
  const list = document.getElementById('settingsGoalsList');
  list.innerHTML = '';
  appState.goals.forEach((g,i) => {
    const div = document.createElement('div');
    div.className = 'border p-3 rounded-lg space-y-2';
    div.innerHTML = `
      <p>Goal ${i+1}: ${g.name}</p>
      <input type="text" class="settings-goal-bank input-field w-full text-sm" data-id="${g.id}" value="${g.bankName}" />
      <input type="date" class="settings-goal-date input-field w-full text-sm" data-id="${g.id}" value="${g.targetDate}" />
    `;
    list.appendChild(div);
  });
  document.getElementById('settingsModal').classList.remove('hidden');
}
function closeSettingsModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}
function handleSettingsSubmit(e) {
  e.preventDefault();
  document.querySelectorAll('.settings-goal-bank').forEach(inp => {
    const g = appState.goals.find(g=>g.id===inp.dataset.id);
    if (g) g.bankName = inp.value.trim();
  });
  document.querySelectorAll('.settings-goal-date').forEach(inp => {
    const g = appState.goals.find(g=>g.id===inp.dataset.id);
    if (g) g.targetDate = inp.value;
  });
  saveAppState();
  closeSettingsModal();
  showNotification('Settings saved!');
  updateDashboard();
}
function handleProfilePicUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    appState.settings.profilePic = reader.result;
    saveAppState();
    applyProfileDisplay();
  };
  reader.readAsDataURL(file);
}

// ------------------------------
// 14) Forgot Password Flow
// ------------------------------
function openForgotModal() {
  document.getElementById('forgotPasswordModal').classList.remove('hidden');
  document.getElementById('forgotEmail').value = '';
  document.getElementById('newPasswordContainer').classList.add('hidden');
  document.getElementById('forgotSubmit').textContent = 'Next';
}
function closeForgotModal() {
  document.getElementById('forgotPasswordModal').classList.add('hidden');
}
function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  const newPwd = document.getElementById('newPassword').value;
  const cpwd   = document.getElementById('confirmNewPassword').value;
  if (document.getElementById('newPasswordContainer').classList.contains('hidden')) {
    // Step 1: verify email
    if (!email) { showNotification('Enter email','error'); return; }
    if (!appState.auth.users.find(u=>u.email===email)) {
      showNotification('Email not found','error'); return;
    }
    document.getElementById('newPasswordContainer').classList.remove('hidden');
    document.getElementById('forgotSubmit').textContent = 'Reset Password';
  } else {
    // Step 2: reset pwd
    if (!newPwd||!cpwd||newPwd!==cpwd||newPwd.length<6) {
      showNotification('Password invalid','error'); return;
    }
    const idx = appState.auth.users.findIndex(u=>u.email===email);
    appState.auth.users[idx].password = newPwd;
    saveAppState();
    showNotification('Password reset. Please log in.');
    closeForgotModal();
  }
}

// ------------------------------
// 15) Dashboard & Charts
// ------------------------------
function updateDashboard() {
  updateSummaryCards();
  updateNextGoalsDue();
  updateOverallStatus();
  updateOverallExpenses();
  updateGoalCards();
  updateActivityHistory();
  updateExpenseHistory();
  updateHouseholdMembersList();
}

function updateSummaryCards() {
  // Total savings
  const totalSavings = appState.goals.reduce((sum,g)=>sum+g.currentSavings,0);
  document.getElementById('totalSavings').textContent = `₹${formatNumber(totalSavings)}`;
  document.getElementById('totalGoals').textContent    = `${appState.goals.length} goal${appState.goals.length!==1?'s':''}`;

  // Household income
  const householdIncome = appState.household.members.reduce((sum,m)=>sum+m.income,0);
  document.getElementById('householdIncome').textContent       = `₹${formatNumber(householdIncome)}`;
  document.getElementById('householdMemberCount').textContent  = `${appState.household.members.length} member${appState.household.members.length!==1?'s':''}`;

  // Net income
  const totalExpenses = appState.expenses.reduce((sum,e)=>sum+e.amount,0);
  const netIncome     = householdIncome - totalExpenses;
  document.getElementById('netIncome').textContent = `₹${formatNumber(netIncome)}`;
  document.getElementById('leftoverIncome').textContent = 
    netIncome>0 
      ? `Leftover: ₹${formatNumber(netIncome)}`
      : 'Expenses exceed income!';
  
  // Daily income
  const daily = householdIncome>0 ? (householdIncome/30).toFixed(2) : 0;
  document.getElementById('dailyIncome').textContent = `₹${formatNumber(daily)} / day`;
}

function updateNextGoalsDue() {
  const container = document.getElementById('nextGoalsContainer');
  container.innerHTML = '';
  if (!appState.goals.length) {
    container.innerHTML = '<p class="text-gray-500">No goals yet.</p>';
    return;
  }
  const sorted = [...appState.goals].sort((a,b)=>new Date(a.targetDate)-new Date(b.targetDate));
  sorted.forEach(goal => {
    const daysLeft = Math.ceil((new Date(goal.targetDate)-new Date())/(1000*60*60*24));
    const rel = formatRelativeDue(daysLeft);
    const row = document.createElement('div');
    row.className = 'flex justify-between';
    row.innerHTML = `
      <span>${goal.name}</span>
      <span>${rel}</span>
      <span class="text-gray-500">${formatDate(goal.targetDate)}</span>
    `;
    container.appendChild(row);
  });
}

function updateOverallStatus() {
  const totalCost   = appState.goals.reduce((sum,g)=>sum+g.cost,0);
  const totalSaved  = appState.goals.reduce((sum,g)=>sum+g.currentSavings,0);
  const totalRemain = totalCost - totalSaved;
  document.getElementById('overallTotalCost').textContent   = `₹${formatNumber(totalCost)}`;
  document.getElementById('overallSaved').textContent       = `₹${formatNumber(totalSaved)}`;
  document.getElementById('overallRemaining').textContent   = `₹${formatNumber(totalRemain)}`;
}

function updateOverallExpenses() {
  const totalExp = appState.expenses.reduce((sum,e)=>sum+e.amount,0);
  const uniqueCats = new Set(appState.expenses.map(e=>e.category)).size;
  document.getElementById('overallExpenseAmount').textContent = `₹${formatNumber(totalExp)}`;
  document.getElementById('overallExpenseCats').textContent   = uniqueCats;
  document.getElementById('expenseCategoriesCount').textContent = `${uniqueCats} categories`;
  document.getElementById('totalExpenses').textContent       = `₹${formatNumber(totalExp)}`;
}

function updateGoalCards() {
  const wrapper = document.getElementById('goalCards');
  wrapper.innerHTML = '';
  if (!appState.goals.length) {
    wrapper.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">No savings goals yet.</p>';
    return;
  }
  appState.goals.forEach(goal => {
    const cd = getCategoryDetails(goal.category);
    const contribEls = goal.contributors.map(id => {
      const m = appState.household.members.find(x=>x.id===id);
      return m
        ? `<div class="contributor-avatar" title="${m.name}">${m.name.charAt(0)}</div>`
        : '';
    }).join('');
    const remaining = goal.cost - goal.currentSavings;
    const pct = Math.min(100,((goal.currentSavings/goal.cost)*100).toFixed(1));
    const daysLeft = Math.ceil((new Date(goal.targetDate)-new Date())/(1000*60*60*24)) || 1;
    const dailyReq = (remaining/daysLeft).toFixed(2);

    const card = document.createElement('div');
    card.className = `goal-card ${cd.colorClass} bg-white rounded-xl shadow-md p-6 relative`;
    card.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center">
          <img src="${cd.imgUrl}" class="category-img mr-3" />
          <div>
            <h3 class="text-lg font-semibold">${goal.name}</h3>
            <p class="text-xs text-gray-500">${getCategoryName(goal.category)}</p>
            <p class="text-sm text-gray-500">Bank: ${goal.bankName}</p>
            <p class="text-sm text-gray-500">Target: ${formatDate(goal.targetDate)}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold">₹${formatNumber(goal.currentSavings)}</p>
          <p class="text-xs text-gray-500">of ₹${formatNumber(goal.cost)}</p>
        </div>
      </div>
      <div class="mb-4">
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div class="progress-bar bg-indigo-600 h-2.5 rounded-full" style="width:${pct}%"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500">
          <span>${pct}%</span><span>₹${formatNumber(remaining)} left</span>
        </div>
      </div>
      <div class="mb-4 flex space-x-2">${contribEls}</div>
      <div class="text-xs text-gray-600">
        You need ₹${formatNumber(parseFloat(dailyReq))}/day
      </div>
      <div class="absolute top-2 right-2 text-xs text-gray-500">
        <span id="countdown-${goal.id}" class="font-mono"></span>
      </div>
    `;
    card.onclick = () => openGoalDetails(goal.id);
    wrapper.appendChild(card);
  });
  updateAllCountdowns();
}

function updateAllCountdowns() {
  appState.goals.forEach(goal => {
    const el = document.getElementById(`countdown-${goal.id}`);
    if (!el) return;
    const diff = new Date(goal.targetDate) - new Date();
    if (diff <= 0) { el.textContent = 'Past due'; return; }
    const d = Math.floor(diff/864e5),
          h = Math.floor(diff%864e5/36e5),
          m = Math.floor(diff%36e5/6e4),
          s = Math.floor(diff%6e4/1e3);
    el.textContent = `${d}d ${h}h ${m}m ${s}s`;
  });
}

function updateActivityHistory() {
  const tbody = document.getElementById('activityHistorySavings');
  tbody.innerHTML = '';
  if (!appState.savings.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500">No savings recorded</td></tr>`;
    return;
  }
  [...appState.savings].sort((a,b)=>new Date(b.date)-new Date(a.date))
    .forEach(entry => {
      const member = appState.household.members.find(m=>m.id===entry.memberId);
      const goal   = appState.goals.find(g=>g.id===entry.goalId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDate(entry.date)}</td>
        <td>${member?member.name:'Unknown'}</td>
        <td>${goal?goal.name:'Unknown'}</td>
        <td>₹${formatNumber(entry.amount)}</td>
        <td><button class="text-red-500 delete-saving-btn">Delete</button></td>
      `;
      tr.querySelector('.delete-saving-btn').onclick = () => {
        appState.savings = appState.savings.filter(s=>s.id!==entry.id);
        saveAppState();
        updateDashboard();
        showNotification('Entry deleted');
      };
      tbody.appendChild(tr);
    });
}

function updateExpenseHistory() {
  const tbody = document.getElementById('activityHistoryExpenses');
  tbody.innerHTML = '';
  if (!appState.expenses.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500">No expenses recorded</td></tr>`;
    return;
  }
  [...appState.expenses].sort((a,b)=>new Date(b.date)-new Date(a.date))
    .forEach(entry => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDate(entry.date)}</td>
        <td>${entry.category}</td>
        <td>${entry.subcategory}</td>
        <td>₹${formatNumber(entry.amount)}</td>
        <td><button class="text-red-500 delete-expense-btn">Delete</button></td>
      `;
      tr.querySelector('.delete-expense-btn').onclick = () => {
        appState.expenses = appState.expenses.filter(x=>x.id!==entry.id);
        saveAppState();
        updateDashboard();
        showNotification('Expense deleted');
      };
      tbody.appendChild(tr);
    });
}

function updateHouseholdMembersList() {
  const container = document.getElementById('householdMembersList');
  container.innerHTML = '';
  appState.household.members.forEach(member => {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-xl shadow-md p-4 flex justify-between';
    div.innerHTML = `
      <div class="flex items-center space-x-4">
        <div class="contributor-avatar">${member.name.charAt(0)}</div>
        <div>
          <p class="font-medium">${member.name}</p>
          <p class="text-sm text-gray-500">₹${formatNumber(member.income)} / month</p>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

// ------------------------------
// 16) Category Helpers
// ------------------------------
function getCategoryDetails(cat) {
  const map = {
    home:        { imgUrl:'https://cdn-icons-png.flaticon.com/512/2163/2163350.png', colorClass:'goal-card-home' },
    car:         { imgUrl:'https://cdn-icons-png.flaticon.com/512/3097/3097182.png', colorClass:'goal-card-car' },
    electronics: { imgUrl:'https://cdn-icons-png.flaticon.com/512/1261/1261106.png',colorClass:'goal-card-electronics' },
    furniture:   { imgUrl:'https://cdn-icons-png.flaticon.com/512/2603/2603741.png',colorClass:'goal-card-furniture' },
    other:       { imgUrl:'https://cdn-icons-png.flaticon.com/512/6833/6833470.png',colorClass:'goal-card-other' }
  };
  return map[cat] || map.other;
}

function getCategoryName(cat) {
  const names = {
    home:'Home/Property',
    car:'Vehicle',
    electronics:'Electronics',
    furniture:'Furniture',
    other:'Other'
  };
  return names[cat] || 'Other';
}

// ------------------------------
// 17) Daily Goals Popup
// ------------------------------
function showDailyGoalsModal() {
  const modal     = document.getElementById('dailyGoalsModal');
  const container = modal.querySelector('.overflow-x-auto');
  container.innerHTML = '';

  if (!appState.goals.length) {
    const empty = document.createElement('div');
    empty.className = 'goal-card-popup snap-start text-gray-600';
    empty.textContent = 'No active goals';
    container.appendChild(empty);
  } else {
    appState.goals.forEach(goal => {
      const d = calculateDailyRequirement(goal);
      const card = document.createElement('div');
      card.className = 'goal-card-popup snap-start';
      card.innerHTML = `
        <h4 class="font-semibold text-lg mb-2">${goal.name}</h4>
        <p class="text-xl font-bold mb-2">₹${formatNumber(d)} / day</p>
        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div class="bg-indigo-600 h-2 rounded-full" style="width:${Math.min(100,(goal.currentSavings/goal.cost)*100)}%"></div>
        </div>
        <p class="text-xs text-gray-500">${Math.min(100,((goal.currentSavings/goal.cost)*100).toFixed(1))}% complete</p>
      `;
      container.appendChild(card);
    });
  }

  modal.classList.remove('hidden');
}

document.getElementById('closeDailyGoals').addEventListener('click', () => {
  document.getElementById('dailyGoalsModal').classList.add('hidden');
});
