// script.js

// --- App State ---
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

// --- Helpers ---
function saveAppState() {
  localStorage.setItem('dreamTrackerApp', JSON.stringify(appState));
}
function formatNumber(num) {
  return Number(num).toLocaleString('en-IN');
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}
function generateId() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

// Calculate how much to save per day for a goal
function calculateDailyRequirement(goal) {
  const today = Date.now();
  const target = new Date(goal.targetDate).getTime();
  let days = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  days = days > 0 ? days : 1;
  const remaining = goal.cost - goal.currentSavings;
  return Math.ceil(remaining / days);
}

// --- Screen Management ---
function showAuthScreen() {
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('openSettingsBtn').classList.add('hidden');
}
function showDashboard() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('openSettingsBtn').classList.remove('hidden');
}

// --- Profile & Theme ---
function applyProfileDisplay() {
  const img = document.getElementById('profilePic');
  const initial = document.getElementById('avatarInitial');
  if (appState.settings.profilePic) {
    img.src = appState.settings.profilePic;
    img.classList.remove('hidden');
    initial.classList.add('hidden');
  } else {
    img.classList.add('hidden');
    initial.classList.remove('hidden');
    initial.textContent = appState.auth.currentUser.name.charAt(0).toUpperCase();
  }
}
function showNotification(msg, type = 'success') {
  const notif = document.getElementById('notification');
  const icon = document.getElementById('notificationIcon');
  document.getElementById('notificationText').textContent = msg;
  icon.innerHTML = type === 'error'
    ? `<img src="https://cdn-icons-png.flaticon.com/512/1828/1828774.png" class="w-6 h-6 text-red-500"/>`
    : `<img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" class="w-6 h-6 text-green-500"/>`;
  notif.classList.remove('translate-y-20','opacity-0');
  setTimeout(()=> notif.classList.add('translate-y-20','opacity-0'), 3000);
}
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  appState.theme = appState.theme === 'light' ? 'dark' : 'light';
  saveAppState();
}

// --- Authentication ---
function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pwd  = document.getElementById('signupPassword').value;
  const cpwd = document.getElementById('signupConfirmPassword').value;
  if (!name||!email||!pwd||pwd!==cpwd) {
    showNotification('Please fill correctly','error');
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
  const pwd = document.getElementById('loginPassword').value;
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
// After signup/login:
function uponLoginSuccess() {
  showDashboard();
  updateDashboard();
  showDailyGoalsModal();
}

// --- Household & Goals Setup ---
function handleHouseholdFormSubmit(e) {
  e.preventDefault();
  appState.household.name = document.getElementById('householdName').value.trim();
  const primary = {
    id: generateId(),
    name: document.getElementById('primaryMemberName').value.trim(),
    income: +document.getElementById('primaryMemberIncome').value,
    isPrimary: true
  };
  appState.household.members = [primary];
  document.querySelectorAll('.household-member').forEach(el=>{
    const name = el.querySelector('.member-name').value.trim();
    const income = +el.querySelector('.member-income').value;
    if (name) appState.household.members.push({ id: generateId(), name, income, isPrimary:false });
  });
  saveAppState();
  showGoalsSetup();
  updateGoalContributors();
}
function handleGoalsFormSubmit(e) {
  e.preventDefault();
  appState.goals = [];
  document.querySelectorAll('.goal-item').forEach(item=>{
    const cat = item.querySelector('.goal-category').value;
    const nm  = item.querySelector('.goal-name').value.trim();
    const cost= +item.querySelector('.goal-cost').value;
    const dt  = item.querySelector('.goal-date').value;
    const bank= item.querySelector('.goal-bank').value.trim();
    const contrib = Array.from(item.querySelectorAll('.goal-contributor-checkbox:checked'))
                         .map(cb=>cb.value);
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
  showNotification('Savings goals created!');
}
function addHouseholdMemberField() {
  const container = document.getElementById('householdMembers');
  const div = document.createElement('div');
  div.className = 'flex space-x-4 household-member';
  div.innerHTML = `
    <input type="text" class="member-name input-field flex-1" placeholder="Name"/>
    <input type="number" class="member-income input-field w-24" placeholder="₹"/>
  `;
  container.appendChild(div);
}
function addGoalField() {
  const list = document.getElementById('goalsList');
  const idx  = list.children.length + 1;
  const div = document.createElement('div');
  div.className = 'goal-item border p-4 rounded-lg relative';
  div.innerHTML = `
    <h3 class="text-lg font-medium">Goal #${idx}
      <button class="remove-goal absolute top-2 right-2 text-gray-500">&times;</button>
    </h3>
    <select class="goal-category input-field w-full mb-2" required>
      <option value="">Category</option>
      <option value="home">Home/Property</option>
      <option value="car">Vehicle</option>
      <option value="electronics">Electronics</option>
      <option value="furniture">Furniture</option>
      <option value="other">Other</option>
    </select>
    <input type="text" class="goal-name input-field w-full mb-2" placeholder="Item Name" required/>
    <div class="relative mb-2">
      <span class="absolute left-2 top-2 text-gray-500">₹</span>
      <input type="number" class="goal-cost input-field pl-6 w-full" placeholder="Total Cost" required/>
    </div>
    <input type="date" class="goal-date input-field w-full mb-2" required/>
    <input type="text" class="goal-bank input-field w-full mb-2" placeholder="Bank Name" required/>
    <div class="goal-contributors flex flex-wrap gap-2"></div>
  `;
  list.appendChild(div);

  div.querySelector('.remove-goal').onclick = () => {
    div.remove();
    Array.from(list.children).forEach((g,i)=> g.querySelector('h3').firstChild.textContent = `Goal #${i+1}`);
  };

  updateGoalContributors();
}
function updateGoalContributors() {
  document.querySelectorAll('.goal-contributors').forEach(wrapper => {
    wrapper.innerHTML = '';
    appState.household.members.forEach(m => {
      const id = `cb-${m.id}-${Math.random().toString(36).slice(2)}`;
      const div = document.createElement('div');
      div.className = 'flex items-center space-x-1';
      div.innerHTML = `
        <input type="checkbox" id="${id}" value="${m.id}" class="goal-contributor-checkbox"/>
        <label for="${id}" class="text-sm">${m.name}</label>
      `;
      wrapper.appendChild(div);
    });
  });
}

// --- Savings & Expenses ---
function openSavingsModal()
    {       
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
function closeSavingsModal()
    { 
        document.getElementById('savingsModal').classList.add('hidden');

     }
function handleAddSavings(e){ 
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

function openExpenseModal(){       // Reset form
      document.getElementById('addExpenseForm').reset();
      document.getElementById('expenseSubcategory').innerHTML = '<option value="">Select Subcategory</option>';
      document.getElementById('customExpenseCategoryContainer').classList.add('hidden');
      document.getElementById('customExpenseSubcategoryContainer').classList.add('hidden');
      document.getElementById('subCategoryContainer').classList.remove('hidden');

      document.getElementById('expenseModal').classList.remove('hidden');
     }
function closeExpenseModal(){
    document.getElementById('expenseModal').classList.add('hidden');
}
function handleAddExpense(e){ 
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

// Expense categories map
const expenseCategories = {
  Bills:['Credit Card Bills','Electricity Bills','Mobile/DTH Bills','Wi-Fi Bill'],
  Rent:['House Rent','Furniture Rent','Maintenance Fee'],
  Kitchen:['Food','Grocery'],
  Garage:['Fuel','Other'],
  Travel:['Hotel','Travel','Food (Travel)'],
  Shopping:['Shopping'],
  Other:['Miscellaneous']
};
document.getElementById('expenseCategory').onchange = function(){
  document.getElementById('expenseCategory').addEventListener('change', function() {
  const cat = this.value;
  const subcatSelect = document.getElementById('expenseSubcategory');
  // reset subcategory dropdown
  subcatSelect.innerHTML = '<option value="">Select Subcategory</option>';

  if (cat === 'Custom') {
    // hide the built-in subcategory dropdown, show custom fields
    document.getElementById('subCategoryContainer').classList.add('hidden');
    document.getElementById('customExpenseCategoryContainer').classList.remove('hidden');
    document.getElementById('customExpenseSubcategoryContainer').classList.remove('hidden');
  } else {
    // show normal subcategory dropdown, hide custom fields
    document.getElementById('subCategoryContainer').classList.remove('hidden');
    document.getElementById('customExpenseCategoryContainer').classList.add('hidden');
    document.getElementById('customExpenseSubcategoryContainer').classList.add('hidden');

    // populate from your mapping
    const subs = expenseCategories[cat] || [];
    subs.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = sub;
      subcatSelect.appendChild(opt);
    });
  }
});

};

// --- Dashboard Rendering ---
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
      // Calculate total savings
      const totalSavings = appState.goals.reduce((sum, goal) => sum + goal.currentSavings, 0);
      document.getElementById('totalSavings').textContent = `₹${formatNumber(totalSavings)}`;
      document.getElementById('totalGoals').textContent = `${appState.goals.length} goal${
        appState.goals.length !== 1 ? 's' : ''
      }`;

      // Calculate household income
      const householdIncome = appState.household.members.reduce(
        (sum, member) => sum + member.income,
        0
      );
      document.getElementById('householdIncome').textContent = `₹${formatNumber(
        householdIncome
      )}`;
      document.getElementById(
        'householdMemberCount'
      ).textContent = `${appState.household.members.length} member${
        appState.household.members.length !== 1 ? 's' : ''
      }`;
        // Calculate net income (NEW CODE)
  const totalExpenses = appState.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netIncome = householdIncome - totalExpenses;
  document.getElementById('netIncome').textContent = `₹${formatNumber(netIncome)}`;

        // Leftover income after expenses
        document.getElementById('leftoverIncome').textContent = 
        netIncome > 0 
            ? `Leftover available for savings: ₹${formatNumber(netIncome)}`
            : 'Warning: Expenses exceed income!';

      // Calculate daily income (assuming 30 days in a month)
      const dailyIncome = householdIncome > 0 ? (householdIncome / 30).toFixed(2) : 0;
      document.getElementById(
        'dailyIncome'
      ).textContent = `₹${formatNumber(parseFloat(dailyIncome))} / day`; 
    }
function updateNextGoalsDue() { 
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

// --- Category Helpers ---
function getCategoryDetails(cat) {
  const map = {
    home: { img:'https://cdn-icons-png.flaticon.com/512/2163/2163350.png', cls:'goal-card-home' },
    car:  { img:'https://cdn-icons-png.flaticon.com/512/3097/3097182.png', cls:'goal-card-car' },
    electronics:{img:'https://cdn-icons-png.flaticon.com/512/1261/1261106.png',cls:'goal-card-electronics'},
    furniture:{img:'https://cdn-icons-png.flaticon.com/512/2603/2603741.png',cls:'goal-card-furniture'},
    other:{img:'https://cdn-icons-png.flaticon.com/512/6833/6833470.png',cls:'goal-card-other'}
  };
  return map[cat]||map.other;
}
function getCategoryName(cat){
  const names = { home:'Home/Property',car:'Vehicle',electronics:'Electronics',furniture:'Furniture',other:'Other' };
  return names[cat]||'Other';
}

// --- Daily Goals Popup ---
function showDailyGoalsModal(){
  const modal = document.getElementById('dailyGoalsModal');
  const cont  = modal.querySelector('.overflow-x-auto');
  cont.innerHTML = '';
  if (!appState.goals.length) {
    cont.innerHTML = '<p class="text-gray-600">No active goals</p>';
  } else {
    appState.goals.forEach(g=>{
      const d = calculateDailyRequirement(g);
      const card = document.createElement('div');
      card.className = 'goal-card-popup snap-start';
      card.innerHTML = `
        <h4 class="font-semibold text-lg mb-2">${g.name}</h4>
        <p class="text-xl font-bold mb-2">₹${formatNumber(d)} / day</p>
        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div class="bg-indigo-600 h-2 rounded-full" style="width:${Math.min(100,(g.currentSavings/g.cost)*100)}%"></div>
        </div>
        <p class="text-xs text-gray-500">${Math.min(100,((g.currentSavings/g.cost)*100).toFixed(1))}% complete</p>
      `;
      cont.appendChild(card);
    });
  }
  modal.classList.remove('hidden');
}
document.getElementById('closeDailyGoals').onclick = ()=>{
  document.getElementById('dailyGoalsModal').classList.add('hidden');
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', ()=>{
  // Hide everything by default
  showAuthScreen();
  applyProfileDisplay();
  // Hook up auth forms
  document.getElementById('userSignupForm').addEventListener('submit', handleSignup);
  document.getElementById('userLoginForm').addEventListener('submit', handleLogin);
  document.getElementById('toggleTheme').onclick = toggleTheme;
  // Load saved state
  const saved = localStorage.getItem('dreamTrackerApp');
  if (saved) Object.assign(appState, JSON.parse(saved));
  if (appState.auth.isLoggedIn) uponLoginSuccess();
});
