    //Link the input to the button
    document.getElementById('uploadBtn').addEventListener('click', () =>{
    document.getElementById('fileInput').click();});

    //Setup Input using FormData
    document.getElementById('fileInput').addEventListener('change', (e) =>{
    const file = e.target.files[0];
    if(!file)
    return;
    const formData = new FormData();
    formData.append('file', file);
    fetch('/transactions/upload', {method: 'POST', body: formData})
    .then(r=> r.text())
    .then(message => {
    alert(message);
    location.reload(); //Reloads to page to update the charts and other dashboard info
});
});

    //Setup Manual Addition Of Expenses By Opening dialog
    document.getElementById('addExpenseBtn').addEventListener('click', () =>{
    document.getElementById('addExpenseDialog').showModal();
});

    //Setup Cancel Button
    document.getElementById('cancelExpenseBtn').addEventListener('click', () =>{
    document.getElementById('addExpenseDialog').close();
});

    //Build a object from the four fields and POST it as a JSON
    document.getElementById('addExpenseForm').addEventListener('submit', (e) =>{
    e.preventDefault();
    const transaction = {
    date: document.getElementById('expenseDate').value,
    description: document.getElementById('expenseDescription').value,
    amount: parseFloat(document.getElementById('expenseAmount').value),
    category: document.getElementById('expenseCategory').value};

    fetch('transactions', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(transaction),
}).then(()=> location.reload());
})

    const CATEGORY_COLORS = {
    'Food & Dining': '#8FB489',
    'Transport': '#7FA7C0',
    'Subscriptions': '#D9B370',
    'Uncategorized': '#6B7568'
};
    const FALLBACK_COLOR = '#D08A63';

    const CATEGORY_PILL_CLASS = {
    'Food & Dining': 'food',
    'Transport': 'transport',
    'Groceries': 'groceries',
    'Subscriptions': 'subs',
    'Uncategorized': 'none'
};

    function sortMonthKeys(keys){
    return keys.sort((a,b) => {
    const [ay,am] = a.split('-').map(Number);
    const [by,bm] = b.split('-').map(Number);
    return ay !== by ? ay-by:am-bm;
});
}

    function hexToRgba(hex,alpha){
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

    function lightenColor(hex, percent) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const newR = Math.round(r + (255 - r) * percent);
    const newG = Math.round(g + (255 - g) * percent);
    const newB = Math.round(b + (255 - b) * percent);
    return `rgb(${newR}, ${newG}, ${newB})`;
}

    function makeBarGradient(ctx, hexColor, horizontal) {
    const gradient = horizontal
    ? ctx.createLinearGradient(0, 0, ctx.canvas.width, 0)
    : ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, lightenColor(hexColor, 0.65));
    gradient.addColorStop(0.7, hexColor);
    gradient.addColorStop(1, hexToRgba(hexColor, 0.65));
    return gradient;
}

    function formatCurrency(amount) {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

    Promise.all([
    fetch('/transactions').then(r => r.json()),
    fetch('/transactions/summary').then(r => r.json()),
    fetch('/transactions/monthly-summary').then(r => r.json())
    ]).then(([transactions, categoryData, monthlyData]) => {

    const totalSpent = Object.values(categoryData).reduce((sum, v) => sum + v, 0);
    const topEntry = Object.entries(categoryData).reduce((best, entry) => entry[1] > best[1] ? entry : best);
    const monthlyValues = Object.values(monthlyData);
    const monthlyAverage = monthlyValues.reduce((sum, v) => sum + v, 0) / monthlyValues.length;
    const sortedTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    let visibleCount = 5;
    function renderActivityTable(){
    //Filter Search
    const searchTerm = document.getElementById('txSearch').value.toLowerCase();
    const selectedCategory = document.getElementById('txCategoryFilter').value;
    const filteredTx = sortedTx.filter(tx => tx.description.toLowerCase().includes(searchTerm) && (selectedCategory === 'All categories' || tx.category === selectedCategory));

    const rows = filteredTx.slice(0, visibleCount).map(tx => `
    <tr>
        <td class="date">${tx.date}</td>
        <td class="desc">${tx.description}</td>
        <td><span class="pill ${CATEGORY_PILL_CLASS[tx.category] || 'none'}">${tx.category}</span></td>
        <td class="num">${formatCurrency(tx.amount)}</td>
    </tr>
`).join('');
    document.getElementById('txTableBody').innerHTML = rows;
    const btn = document.getElementById('showMoreBtn');
    if(visibleCount >= filteredTx.length){
    btn.textContent = "That's everything";
    btn.disabled = true;
}
    else {
    btn.textContent = "Show more";
    btn.disabled = false;
}
}
    renderActivityTable();
    document.getElementById('showMoreBtn').addEventListener('click', () => {
    visibleCount += 5;
    renderActivityTable();
});

    //Reset visible count back to 5 after filter search takes place
    document.getElementById('txSearch').addEventListener('input', () => {
    visibleCount = 5;
    renderActivityTable();
});
    document.getElementById('txCategoryFilter').addEventListener('change', () => {
    visibleCount = 5;
    renderActivityTable();
})

    document.getElementById('statTotalSpent').textContent = formatCurrency(totalSpent);
    document.getElementById('statMonthsTracked').textContent = monthlyValues.length + ' months tracked';
    document.getElementById('statTopCategory').textContent = topEntry[0];
    document.getElementById('statTopCategorySub').textContent = formatCurrency(topEntry[1]) + ' spent';
    document.getElementById('statMonthlyAvg').textContent = formatCurrency(monthlyAverage);
    document.getElementById('statTxCount').textContent = transactions.length;
    document.getElementById('statTxCountSub').textContent = Object.keys(categoryData).length + ' categories';

    const categoryLabels = Object.keys(categoryData);
    const categoryValues = Object.values(categoryData);

    const monthLabels = sortMonthKeys(Object.keys(monthlyData));
    const sortedMonthValues = monthLabels.map(k => monthlyData[k]);

    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const categoryGradients = categoryLabels.map(name => makeBarGradient(categoryCtx, CATEGORY_COLORS[name] || FALLBACK_COLOR, true));

    //Search & Filter Feature in Recent Activity
    const filterSelect = document.getElementById('txCategoryFilter');
    filterSelect.innerHTML = '<option>All categories</option>' + categoryLabels.map(name => `<option>${name}</option>`).join('');

    new Chart(document.getElementById('categoryChart'), {
    type: 'bar',
    data: {
    labels: categoryLabels,
    datasets: [{
    label: 'Spending by category',
    data: categoryValues,
    backgroundColor: categoryGradients,
    borderRadius: 999,
    maxBarThickness: 14,
    hoverBackgroundColor: categoryLabels.map(name => lightenColor(CATEGORY_COLORS[name] || FALLBACK_COLOR, 0.15))
}]
},
    options: {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { grid: { color: 'rgba(230,233,227,.10)' } }, y: { grid: { display: false } } }
}
});

    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    const monthGradients = sortedMonthValues.map((v, i) => makeBarGradient(monthlyCtx, i === sortedMonthValues.length - 1 ? '#D9B370' : '#8FB489', false));
    new Chart(document.getElementById('monthlyChart'), {
    type: 'bar',
    data: {
    labels: monthLabels,
    datasets: [{
    label: 'Spending over time',
    data: sortedMonthValues,
    backgroundColor: monthGradients,
    borderRadius: {topLeft: 10, topRight: 10, bottomLeft: 4, bottomRight: 4},
    maxBarThickness: 64,
    hoverBackgroundColor: sortedMonthValues.map((v, i) => lightenColor(i === sortedMonthValues.length - 1 ? '#D9B370' : '#8FB489', 0.15))
}]
},
    options: {
    plugins: { legend: { display: false } },
    scales: { y: { grid: { color: 'rgba(230,233,227,.10)' } }, x: { grid: { display: false } } }
}
});
});
