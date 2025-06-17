// ------------------------------
// 0) Application State & Persistence
// ------------------------------
const appState = {
  auth: { isLoggedIn: false, currentUser: null, users: [] },
  household: { name: '', members: [] },
  goals: [],
  savings: [],
  expenses: [],
  theme: 'light',
  settings: { profilePic: '' }
};

function saveAppState() {
  localStorage.setItem('dreamTrackerApp', JSON.stringify(appState));
}

function loadAppState() {
  const saved = localStorage.getItem('dreamTrackerApp');
  if (saved) {
    Object.assign(appState, JSON.parse(saved));
  }
}

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// ------------------------------
// 1) Utility Formatters
// ------------------------------
function formatNumber(n) {
  return n.toLocaleString('en-IN');
}

function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRelativeDue(days) {
  if (days < 0) return 'Past due';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `In ${days} days`;
}

function calculateDailyRequirement(goal) {
  const today = new Date();
  const target = new Date(goal.targetDate);
  const days = Math.max(1, Math.ceil((target - today) / (1000*60*60*24)));
  return ((goal.cost - goal.currentSavings) / days).toFixed(2);
}

// ------------------------------
// 2) DOM Helpers & Notification
// ------------------------------
function showNotification(text, type = 'success') {
  const notif = document.getElementById('notification');
  notif.querySelector('#notificationText').textContent = text;
  notif.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    notif.classList.add('translate-y-20', 'opacity-0');
  }, 2500);
}

function applyProfileDisplay() {
  const user = appState.auth.currentUser;
  if (user) {
    document.getElementById('userDisplay').classList.remove('hidden');
    document.getElementById('currentUserName').textContent = user.name;
    if (appState.settings.profilePic) {
      document.getElementById('profilePic').src = appState.settings.profilePic;
      document.getElementById('profilePic').classList.remove('hidden');
      document.getElementById('avatarInitial').classList.add('hidden');
    }
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('openSettingsBtn').classList.remove('hidden');
  }
}

// ------------------------------
// 3) Screen Management
// ------------------------------
function showAuthScreen() {
  ['authScreen','welcomeScreen','householdSetup','goalsSetup','dashboard']
    .forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById('authScreen').classList.remove('hidden');
}
function showWelcome()     { hideAll(); document.getElementById('welcomeScreen').classList.remove('hidden'); }
function showHousehold()   { hideAll(); document.getElementById('householdSetup').classList.remove('hidden'); }
function showGoalsSetup()  { hideAll(); document.getElementById('goalsSetup').classList.remove('hidden'); }
function showDashboard()   { hideAll(); document.getElementById('dashboard').classList.remove('hidden'); applyProfileDisplay(); updateDashboard(); }
function hideAll() {
  ['authScreen','welcomeScreen','householdSetup','goalsSetup','dashboard']
    .forEach(id => document.getElementById(id).classList.add('hidden'));
}

// ------------------------------
// 4) Authentication
// ------------------------------
function handleSignup(e) {
  e.preventDefault();
  const name = signupName.value.trim(),
        email = signupEmail.value.trim(),
        pwd = signupPassword.value,
        cpwd = signupConfirmPassword.value,
        terms = termsAgree.checked;
  if (!name||!email||!pwd||pwd!==cpwd||pwd.length<6||!terms) {
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
  const email = loginEmail.value.trim(),
        pwd = loginPassword.value;
  const user = appState.auth.users.find(u=>u.email===email&&u.password===pwd);
  if (!user) {
    showNotification('Invalid credentials','error');
    return;
  }
  appState.auth.isLoggedIn = true;
  appState.auth.currentUser = user;
  saveAppState();
  applyProfileDisplay();
  uponLoginSuccess();
  showNotification(`Welcome back, ${user.name}!`);
}

function uponLoginSuccess() {
  showDashboard();
  showDailyGoalsModal();
}

// ------------------------------
// 5) Forgot Password
// ------------------------------
function openForgotModal() {
  forgotPasswordModal.classList.remove('hidden');
  newPasswordContainer.classList.add('hidden');
  forgotSubmit.textContent = 'Next';
}
function closeForgotModal() { forgotPasswordModal.classList.add('hidden'); }

function handleForgotPassword(e) {
  e.preventDefault();
  const email = forgotEmail.value.trim(),
        newPwd = newPassword.value,
        cpwd = confirmNewPassword.value;
  const isStep2 = !newPasswordContainer.classList.contains('hidden');
  if (!isStep2) {
    if (!email) { showNotification('Enter email','error'); return; }
    if (!appState.auth.users.find(u=>u.email===email)) {
      showNotification('Email not found','error'); return;
    }
    newPasswordContainer.classList.remove('hidden');
    forgotSubmit.textContent = 'Reset Password';
  } else {
    if (!newPwd||newPwd!==cpwd||newPwd.length<6) {
      showNotification('Invalid password','error'); return;
    }
    const idx = appState.auth.users.findIndex(u=>u.email===email);
    appState.auth.users[idx].password = newPwd;
    saveAppState();
    showNotification('Password reset. Please log in.');
    closeForgotModal();
  }
}

// ------------------------------
// 6) Household & Goals Setup
// ------------------------------
function handleHouseholdFormSubmit(e) {
  e.preventDefault();
  appState.household.name = householdName.value.trim();
  const primary = {
    id: generateId(),
    name: primaryMemberName.value.trim(),
    income: +primaryMemberIncome.value,
    isPrimary: true
  };
  appState.household.members = [primary];
  document.querySelectorAll('.household-member').forEach(el => {
    const nm = el.querySelector('.member-name').value.trim(),
          inc = +el.querySelector('.member-income').value;
    if (nm) appState.household.members.push({ id: generateId(), name: nm, income: inc, isPrimary:false });
  });
  saveAppState();
  showGoalsSetup();
  updateGoalContributors();
}

function addHouseholdMemberField() {
  const div = document.createElement('div');
  div.className = 'flex space-x-4 household-member';
  div.innerHTML = `
    <input type="text" class="member-name input-field flex-1" placeholder="Name" />
    <input type="number" class="member-income input-field w-24" placeholder="₹" />
  `;
  householdMembers.appendChild(div);
}

function handleGoalsFormSubmit(e) {
  e.preventDefault();
  appState.goals = [];
  document.querySelectorAll('.goal-item').forEach(item=>{
    const cat = item.querySelector('.goal-category').value,
          nm  = item.querySelector('.goal-name').value.trim(),
          cost= +item.querySelector('.goal-cost').value,
          dt  = item.querySelector('.goal-date').value,
          bank= item.querySelector('.goal-bank').value.trim(),
          contrib = Array.from(item.querySelectorAll('.goal-contributor-checkbox:checked')).map(cb=>cb.value);
    if (cat&&nm&&cost>0&&dt&&bank&&contrib.length) {
      appState.goals.push({ id: generateId(), category:cat, name:nm, cost, targetDate:dt, bankName:bank, contributors:contrib, currentSavings:0 });
    }
  });
  saveAppState();
  showDashboard();
  showNotification('Savings goals created!');
}

// When you show the Add-Goal modal you must inject the contributor checkboxes:
function updateGoalContributors() {
  const cont = document.getElementById('modalGoalContributors'),
        fCont = document.querySelectorAll('.goal-contributors');
  cont.innerHTML = '';
  appState.household.members.forEach(m=>{
    const cb = document.createElement('label');
    cb.className = 'flex items-center space-x-2';
    cb.innerHTML = `<input type="checkbox" class="goal-contributor-checkbox" value="${m.id}" /> <span>${m.name}</span>`;
    cont.appendChild(cb);
  });
  // same for each .goal-contributors in the setup form
  fCont.forEach(list=>{
    list.innerHTML = '';
    appState.household.members.forEach(m=>{
      const cb = document.createElement('label');
      cb.className = 'flex items-center space-x-2';
      cb.innerHTML = `<input type="checkbox" class="goal-contributor-checkbox" value="${m.id}" /> <span>${m.name}</span>`;
      list.appendChild(cb);
    });
  });
}

// ------------------------------
// 7) Savings & Expenses Modals
// ------------------------------
function openSavingsModal() { savingsModal.classList.remove('hidden'); populateSavingsModal(); }
function closeSavingsModal(){ savingsModal.classList.add('hidden'); }
function populateSavingsModal() {
  savingsMember.innerHTML = '';
  savingsGoal.innerHTML = '';
  appState.household.members.forEach(m=>{
    savingsMember.innerHTML += `<option value="${m.id}">${m.name}</option>`;
  });
  appState.goals.forEach(g=>{
    savingsGoal.innerHTML += `<option value="${g.id}">${g.name}</option>`;
  });
}
function handleAddSavings(e) {
  e.preventDefault();
  const memberId = savingsMember.value,
        goalId   = savingsGoal.value,
        amount   = +savingsAmount.value,
        date     = savingsDate.value,
        notes    = savingsNotes.value.trim();
  if (memberId&&goalId&&amount>0&&date) {
    appState.savings.push({ id: generateId(), memberId, goalId, amount, date, notes });
    saveAppState();
    updateDashboard();
    showNotification(`₹${formatNumber(amount)} saved`); 
    closeSavingsModal();
  }
}

function openExpenseModal() { expenseModal.classList.remove('hidden'); }
function closeExpenseModal(){ expenseModal.classList.add('hidden'); }
function handleExpenseCategoryChange() {
  const cat = expenseCategory.value,
        sub = expenseSubcategory;
  sub.innerHTML = '<option value="">Select Subcategory</option>';
  if (cat === 'Custom') {
    subCategoryContainer.classList.add('hidden');
    customExpenseCategoryContainer.classList.remove('hidden');
    customExpenseSubcategoryContainer.classList.remove('hidden');
  } else {
    subCategoryContainer.classList.remove('hidden');
    customExpenseCategoryContainer.classList.add('hidden');
    customExpenseSubcategoryContainer.classList.add('hidden');
    (expenseCategories[cat]||[]).forEach(s=>{
      sub.innerHTML += `<option value="${s}">${s}</option>`;
    });
  }
}
function handleAddExpense(e) {
  e.preventDefault();
  let category = expenseCategory.value,
      subcategory = expenseSubcategory.value;
  if (category==='Custom') {
    category = customExpenseCategory.value.trim()||'Other';
    subcategory = customExpenseSubcategory.value.trim()||'Other';
  }
  const amount = +expenseAmount.value,
        date   = expenseDate.value,
        note   = expenseNote.value.trim();
  if (category&&subcategory&&amount>0&&date) {
    appState.expenses.push({ id: generateId(), category, subcategory, amount, date, note });
    saveAppState();
    updateDashboard();
    showNotification(`₹${formatNumber(amount)} expense recorded under ${category} › ${subcategory}`); 
    closeExpenseModal();
  }
}

// Categories map from your old script :contentReference[oaicite:2]{index=2}
const expenseCategories = {
  Bills: ['Credit Card Bills','Electricity Bills','Mobile/DTH Bills','Wi-Fi Bill'],
  Rent: ['House Rent','Furniture Rent','Maintenance Fee'],
  Kitchen: ['Food','Vegetables & Grocery Bills'],
  Garage: ['Fuel','Other Expenses'],
  Travel: ['Hotel Bills','Travel Bills','Food Bills (Travel)'],
  Shopping: ['Shopping Bills'],
  Other: ['Miscellaneous Expenses']
};

// ------------------------------
// 8) Goals Modal (Add/Edit)
// ------------------------------
function openGoalModal() {
  modalEditGoalId.value = '';
  goalModalTitle.textContent = 'Add New Goal';
  updateGoalContributors();
  goalModal.classList.remove('hidden');
}
function closeGoalModal() {
  goalModal.classList.add('hidden');
}
function handleAddGoal(e) {
  e.preventDefault();
  const id = modalEditGoalId.value,
        category = modalGoalCategory.value,
        name = modalGoalName.value.trim(),
        cost = +modalGoalCost.value,
        date = modalGoalDate.value,
        bank = modalGoalBank.value.trim(),
        contrib = Array.from(document.querySelectorAll('#modalGoalContributors input:checked')).map(cb=>cb.value);
  if (!category||!name||cost<=0||!date||!bank||!contrib.length) return;
  if (id) {
    // edit existing
    const g = appState.goals.find(x=>x.id===id);
    Object.assign(g, { category, name, cost, targetDate:date, bankName:bank, contributors:contrib });
    showNotification(`Goal "${name}" updated!`);
  } else {
    // new
    appState.goals.push({ id: generateId(), category, name, cost, targetDate:date, bankName:bank, contributors:contrib, currentSavings:0 });
    showNotification(`New goal "${name}" has been added!`);
  }
  saveAppState();
  closeGoalModal();
  updateDashboard();
}

// ------------------------------
// 9) Manage Members Modal
// ------------------------------
function openMembersModal() {
  membersList.innerHTML = '';
  appState.household.members.forEach(m=>{
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center';
    div.innerHTML = `
      <span>${m.name} (₹${formatNumber(m.income)}/mo)</span>
      <button class="text-red-500 remove-member" data-id="${m.id}">&times;</button>
    `;
    membersList.appendChild(div);
  });
  document.querySelectorAll('.remove-member').forEach(btn=>{
    btn.onclick = () => {
      appState.household.members = appState.household.members.filter(m=>m.id!==btn.dataset.id);
      saveAppState();
      openMembersModal();
      updateDashboard();
    };
  });
  membersModal.classList.remove('hidden');
}
function closeMembersModal() { membersModal.classList.add('hidden'); }
function handleAddMember(e) {
  e.preventDefault();
  const nm = newMemberName.value.trim(),
        inc= +newMemberIncome.value;
  if (!nm||inc<=0) return;
  appState.household.members.push({ id: generateId(), name:nm, income:inc, isPrimary:false });
  saveAppState();
  updateDashboard();
  openMembersModal();
  addMemberForm.reset();
}

// ------------------------------
// 10) Settings Modal
// ------------------------------
function openSettingsModal() {
  settingsGoalsList.innerHTML = '';
  appState.goals.forEach(g=>{
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="space-y-2">
        <p class="font-medium">${g.name}</p>
        <input class="input-field settings-goal-bank w-full" data-id="${g.id}" value="${g.bankName}" />
        <input type="date" class="input-field settings-goal-date w-full" data-id="${g.id}" value="${g.targetDate}" />
      </div>
    `;
    settingsGoalsList.appendChild(div);
  });
  if (appState.settings.profilePic) {
    settingsProfilePicPreview.src = appState.settings.profilePic;
    settingsProfilePicPreview.classList.remove('hidden');
    settingsAvatarInitial.classList.add('hidden');
  }
  settingsModal.classList.remove('hidden');
}
function closeSettingsModal() { settingsModal.classList.add('hidden'); }
function handleSettingsSubmit(e) {
  e.preventDefault();
  document.querySelectorAll('.settings-goal-bank').forEach(inp=>{
    const g = appState.goals.find(x=>x.id===inp.dataset.id);
    if (g) g.bankName = inp.value.trim();
  });
  document.querySelectorAll('.settings-goal-date').forEach(inp=>{
    const g = appState.goals.find(x=>x.id===inp.dataset.id);
    if (g) g.targetDate = inp.value;
  });
  saveAppState();
  closeSettingsModal();
  showNotification('Settings saved successfully!');
  updateDashboard();
}

// Profile pic upload
changeProfilePicBtn.onclick = ()=> profilePicInput.click();
profilePicInput.onchange = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    appState.settings.profilePic = reader.result;
    saveAppState();
    applyProfileDisplay();
  };
  reader.readAsDataURL(file);
};

// ------------------------------
// 11) Logout
// ------------------------------
function performLogout() {
  appState.auth.isLoggedIn = false;
  appState.auth.currentUser = null;
  saveAppState();
  showAuthScreen();
}

// ------------------------------
// 12) Dashboard Rendering
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
  renderCharts();
}

function updateSummaryCards() {
  const totalSavings = appState.goals.reduce((s,g)=>s+g.currentSavings,0),
        householdIncome = appState.household.members.reduce((s,m)=>s+m.income,0),
        totalExp = appState.expenses.reduce((s,e)=>s+e.amount,0),
        net = householdIncome - totalExp;
  totalSavingsElem.textContent     = `₹${formatNumber(totalSavings)}`;
  totalGoalsElem.textContent       = `${appState.goals.length} goal${appState.goals.length!==1?'s':''}`;
  householdIncomeElem.textContent  = `₹${formatNumber(householdIncome)}`;
  householdMemberCountElem.textContent = `${appState.household.members.length} member${appState.household.members.length!==1?'s':''}`;
  netIncomeElem.textContent        = `₹${formatNumber(net)}`;
  leftoverIncomeElem.textContent   = net>0 
    ? `Leftover available for savings: ₹${formatNumber(net)}` 
    : 'Warning: Expenses exceed income!';
  const daily = householdIncome>0 ? (householdIncome/30).toFixed(2) : 0;
  dailyIncomeElem.textContent      = `₹${formatNumber(parseFloat(daily))} / day`;
  document.getElementById('monthlyRecommendation').textContent = `Recommended: ₹${formatNumber(daily*30)} / month`;
}

function updateNextGoalsDue() {
  nextGoalsContainer.innerHTML = '';
  if (!appState.goals.length) return nextGoalsContainer.innerHTML = '<p class="text-gray-500">No goals yet.</p>';
  [...appState.goals].sort((a,b)=>new Date(a.targetDate)-new Date(b.targetDate))
    .forEach(g=>{
      const days = Math.ceil((new Date(g.targetDate)-new Date())/(1000*60*60*24));
      const row = document.createElement('div');
      row.className = 'flex justify-between';
      row.innerHTML = `<span>${g.name}</span><span>${formatRelativeDue(days)}</span><span class="text-gray-500">${formatDate(g.targetDate)}</span>`;
      nextGoalsContainer.appendChild(row);
    });
}

function updateOverallStatus() {
  const totalCost = appState.goals.reduce((s,g)=>s+g.cost,0),
        totalSaved= appState.goals.reduce((s,g)=>s+g.currentSavings,0),
        remain   = totalCost - totalSaved;
  overallTotalCost.textContent   = `₹${formatNumber(totalCost)}`;
  overallSaved.textContent       = `₹${formatNumber(totalSaved)}`;
  overallRemaining.textContent   = `₹${formatNumber(remain)}`;
}

function updateOverallExpenses() {
  const totalExp = appState.expenses.reduce((s,e)=>s+e.amount,0);
  const uniqueCats = new Set(appState.expenses.map(e=>e.category)).size;
  overallExpenseAmount.textContent = `₹${formatNumber(totalExp)}`;
  overallExpenseCats.textContent   = `${uniqueCats}`;
  expenseCategoriesCountElem.textContent = `${uniqueCats} categories`;
  totalExpensesElem.textContent     = `₹${formatNumber(totalExp)}`;
}

function updateGoalCards() {
  goalCards.innerHTML = '';
  appState.goals.forEach(g=>{
    const div = document.createElement('div');
    div.className = `card goal-card goal-card-${g.category}`;
    div.innerHTML = `
      <div class="p-4">
        <h4 class="font-semibold">${g.name}</h4>
        <p class="text-sm text-gray-500">${g.category}</p>
        <p class="text-lg font-bold">₹${formatNumber(g.currentSavings)}/${formatNumber(g.cost)}</p>
        <button class="text-indigo-600 text-sm view-details" data-id="${g.id}">Details ›</button>
      </div>
    `;
    div.querySelector('.view-details').onclick = () => openGoalDetails(g.id);
    goalCards.appendChild(div);
  });
}

function updateActivityHistory() {
  const tbody = activityHistorySavings;
  tbody.innerHTML = '';
  if (!appState.savings.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500">No savings recorded</td></tr>`;
    return;
  }
  [...appState.savings].sort((a,b)=>new Date(b.date)-new Date(a.date))
    .forEach(e=>{
      const m = appState.household.members.find(x=>x.id===e.memberId);
      const g = appState.goals.find(x=>x.id===e.goalId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDate(e.date)}</td>
        <td>${m?m.name:'Unknown'}</td>
        <td>${g?g.name:'Unknown'}</td>
        <td>₹${formatNumber(e.amount)}</td>
        <td><button class="text-red-500">Delete</button></td>
      `;
      tr.querySelector('button').onclick = () => {
        appState.savings = appState.savings.filter(x=>x.id!==e.id);
        saveAppState();
        updateDashboard();
        showNotification('Entry deleted');
      };
      tbody.appendChild(tr);
    });
}

function updateExpenseHistory() {
  const tbody = activityHistoryExpenses;
  tbody.innerHTML = '';
  if (!appState.expenses.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500">No expenses recorded</td></tr>`;
    return;
  }
  [...appState.expenses].sort((a,b)=>new Date(b.date)-new Date(a.date))
    .forEach(e=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDate(e.date)}</td>
        <td>${e.category}</td>
        <td>${e.subcategory}</td>
        <td>₹${formatNumber(e.amount)}</td>
        <td><button class="text-red-500">Delete</button></td>
      `;
      tr.querySelector('button').onclick = () => {
        appState.expenses = appState.expenses.filter(x=>x.id!==e.id);
        saveAppState();
        updateDashboard();
        showNotification('Expense deleted');
      };
      tbody.appendChild(tr);
    });
}

function updateHouseholdMembersList() {
  householdMembersList.innerHTML = '';
  appState.household.members.forEach(m=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="flex items-center space-x-4">
        <div class="contributor-avatar">${m.name.charAt(0)}</div>
        <div>
          <p class="font-medium">${m.name}</p>
          <p class="text-sm text-gray-500">₹${formatNumber(m.income)}/mo</p>
        </div>
      </div>
    `;
    householdMembersList.appendChild(div);
  });
}

// ------------------------------
// 13) Charts (using Chart.js loaded in HTML)
// ------------------------------
let incomeExpensesPieChart, monthlyExpensesChart, expenseCategoryChart;

function renderCharts() {
  const householdIncome = appState.household.members.reduce((s,m)=>s+m.income,0),
        totalExp = appState.expenses.reduce((s,e)=>s+e.amount,0);

  // Pie Chart
  const ctxPie = incomeExpensesPie.getContext('2d');
  if (incomeExpensesPieChart) incomeExpensesPieChart.destroy();
  incomeExpensesPieChart = new Chart(ctxPie, {
    type: 'pie',
    data: { labels:['Income','Expenses'], datasets:[{ data:[householdIncome,totalExp] }] },
    options:{ responsive:false, plugins:{ legend:{ position:'bottom' } } }
  });

  // Monthly Expenses Trend
  const months = [...new Set(appState.expenses.map(e=>new Date(e.date).toLocaleString('default',{month:'short'})))];
  const monthData = months.map(m => 
    appState.expenses
      .filter(e=>new Date(e.date).toLocaleString('default',{month:'short'})===m)
      .reduce((s,e)=>s+e.amount,0)
  );
  const ctxLine = monthlyExpensesChart.getContext('2d');
  if (monthlyExpensesChart) monthlyExpensesChart.destroy();
  monthlyExpensesChart = new Chart(ctxLine, {
    type: 'line',
    data: { labels: months, datasets:[{ data: monthData, fill:false }] },
    options:{ responsive:false }
  });

  // Expenses by Category
  const cats = [...new Set(appState.expenses.map(e=>e.category))];
  const catData = cats.map(c=>appState.expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0));
  const ctxCat = expenseCategoryChart.getContext('2d');
  if (expenseCategoryChart) expenseCategoryChart.destroy();
  expenseCategoryChart = new Chart(ctxCat, {
    type: 'bar',
    data: { labels: cats, datasets:[{ data: catData }] },
    options:{ responsive:false, scales:{ x:{ ticks:{ autoSkip:false } } } }
  });
}

// ------------------------------
// 14) Daily Goals Popup
// ------------------------------
function showDailyGoalsModal() {
  dailyGoalsModal.classList.remove('hidden');
  const container = dailyGoalsModal.querySelector('.overflow-x-auto');
  container.innerHTML = '';
  if (!appState.goals.length) {
    container.innerHTML = '<p class="text-gray-600">No active goals</p>';
  } else {
    appState.goals.forEach(g=>{
      const card = document.createElement('div');
      card.className = 'goal-card–popup snap-start';
      card.innerHTML = `
        <h4 class="font-semibold text-lg mb-2">${g.name}</h4>
        <p class="text-sm text-gray-500 mb-1">${g.category}</p>
        <p class="text-xl font-bold mb-2">₹${formatNumber(calculateDailyRequirement(g))} / day</p>
      `;
      container.appendChild(card);
    });
  }
}

closeDailyGoals.onclick = ()=> dailyGoalsModal.classList.add('hidden');

// ------------------------------
// 15) Theme Toggle
// ------------------------------
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  appState.theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  saveAppState();
}

// ------------------------------
// 16) Initialization
// ------------------------------
function initApp() {
  loadAppState();
  if (appState.theme === 'dark') document.body.classList.add('dark-theme');
  if (appState.auth.isLoggedIn) {
    applyProfileDisplay();
    uponLoginSuccess();
  } else showAuthScreen();

  // Attach global event listeners
  signupForm      .addEventListener('submit', handleSignup);
  loginForm       .addEventListener('submit', handleLogin);
  forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  getStartedBtn   .addEventListener('click', () => showHousehold());
  householdForm   .addEventListener('submit', handleHouseholdFormSubmit);
  addHouseholdMember .addEventListener('click', addHouseholdMemberField);
  goalsForm       .addEventListener('submit', handleGoalsFormSubmit);
  addGoalBtn      .addEventListener('click', openGoalModal);
  addSavingsBtn   .addEventListener('click', openSavingsModal);
  cancelSavings   .addEventListener('click', closeSavingsModal);
  addSavingsForm  .addEventListener('submit', handleAddSavings);
  addExpenseBtn   .addEventListener('click', openExpenseModal);
  cancelExpense   .addEventListener('click', closeExpenseModal);
  addExpenseForm  .addEventListener('submit', handleAddExpense);
  expenseCategory .addEventListener('change', handleExpenseCategoryChange);
  addNewGoalBtn   .addEventListener('click', openGoalModal);
  cancelGoal      .addEventListener('click', closeGoalModal);
  addGoalForm     .addEventListener('submit', handleAddGoal);
  manageMembersBtn.addEventListener('click', openMembersModal);
  closeMembersModal.addEventListener('click', closeMembersModal);
  addMemberForm   .addEventListener('submit', handleAddMember);
  openSettingsBtn .addEventListener('click', openSettingsModal);
  closeSettingsBtn.addEventListener('click', closeSettingsModal);
  settingsForm    .addEventListener('submit', handleSettingsSubmit);
  logoutBtn       .addEventListener('click', performLogout);
  logoutInSettings.addEventListener('click', performLogout);
  toggleThemeBtn  .addEventListener('click', toggleTheme);
  closeForgotModal.addEventListener('click', closeForgotModal);
  closeGoalModalBtn.addEventListener('click', closeGoalModal);

  // Start countdown updater (if you choose to show live countdowns)
  // setInterval(updateAllCountdowns, 1000);

  showNotification('', ''); // ensure notification element is in place
}

document.addEventListener('DOMContentLoaded', initApp);
