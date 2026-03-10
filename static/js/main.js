// ============================================
// SECURE APPORTIONMENT SYSTEM — main.js v2
// ============================================

let chartInstance = null;
let lastResults = null;
let lastVotes = null;

const COLORS = [
    '#4f9eff', '#7b61ff', '#3ecf8e', '#f5c842',
    '#ff5f5f', '#ff9f40', '#c084fc', '#34d399',
    '#fb923c', '#60a5fa', '#a78bfa', '#f472b6'
];

// ===================== FILE DRAG & DROP =====================
const fileDrop = document.getElementById('fileDrop');
const fileInput = document.getElementById('csvFile');
const fileSelected = document.getElementById('fileSelected');

fileDrop.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDrop.classList.add('drag-over');
});

fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('drag-over'));

fileDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDrop.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
        setFile(file);
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) setFile(fileInput.files[0]);
});

function setFile(file) {
    fileSelected.innerHTML = `✓ &nbsp;<strong>${file.name}</strong> &nbsp;(${formatBytes(file.size)})`;
    fileSelected.classList.remove('hidden');

    // Preview CSV
    const reader = new FileReader();
    reader.onload = (e) => previewCSV(e.target.result);
    reader.readAsText(file);
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
}

function previewCSV(text) {
    const lines = text.trim().split('\n').slice(0, 8);
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1);

    let html = '<table><thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';

    rows.forEach(row => {
        const cells = row.split(',').map(c => c.trim());
        html += '<tr>';
        cells.forEach(c => html += `<td>${c}</td>`);
        html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('csvPreviewTable').innerHTML = html;
    document.getElementById('csvPreview').classList.remove('hidden');
}

// ===================== SEAT COUNTER =====================
document.getElementById('decreaseBtn').addEventListener('click', () => {
    const input = document.getElementById('totalSeats');
    if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
});

document.getElementById('increaseBtn').addEventListener('click', () => {
    const input = document.getElementById('totalSeats');
    if (parseInt(input.value) < 1000) input.value = parseInt(input.value) + 1;
});

// ===================== FORM SUBMIT =====================
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) { showError('Please select a CSV file.'); return; }

    const seats = parseInt(document.getElementById('totalSeats').value);
    if (!seats || seats < 1) { showError('Please enter a valid seat count.'); return; }

    // Show loading
    document.getElementById('loadingSpinner').classList.remove('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('submitBtn').disabled = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('seats', seats);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        document.getElementById('loadingSpinner').classList.add('hidden');
        document.getElementById('submitBtn').disabled = false;

        if (data.success) {
            lastResults = data.results;
            lastVotes = data.votes;
            displayResults(data.results, data.votes);
        } else {
            showError(data.error || 'Server error. Check your CSV format.');
        }
    } catch (err) {
        document.getElementById('loadingSpinner').classList.add('hidden');
        document.getElementById('submitBtn').disabled = false;
        showError('Could not connect to server. Is Flask running?');
        console.error(err);
    }
});

// ===================== DISPLAY RESULTS =====================
function displayResults(results, votes) {
    const parties = Object.keys(results);
    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
    const totalSeats = Object.values(results).reduce((a, b) => a + b, 0);
    const maxVotes = Math.max(...Object.values(votes));

    // Summary chips
    document.getElementById('resultsSummary').innerHTML = `
        <div class="summary-chip">Parties: <span>${parties.length}</span></div>
        <div class="summary-chip">Total Votes: <span>${totalVotes.toLocaleString()}</span></div>
        <div class="summary-chip">Seats Allocated: <span>${totalSeats}</span></div>
    `;

    // Chart
    renderChart(results, votes, parties, totalSeats);

    // Table
    let tbody = '';
    parties.forEach((party, i) => {
        const seats = results[party];
        const partyVotes = votes[party];
        const votePercent = ((partyVotes / totalVotes) * 100).toFixed(2);
        const seatPercent = ((seats / totalSeats) * 100).toFixed(2);
        const diff = (parseFloat(seatPercent) - parseFloat(votePercent)).toFixed(2);
        const barWidth = Math.round((partyVotes / maxVotes) * 80);

        const diffClass = diff > 0.5 ? 'delta-pos' : diff < -0.5 ? 'delta-neg' : 'delta-neu';
        const diffStr = diff > 0 ? `+${diff}%` : `${diff}%`;
        const color = COLORS[i % COLORS.length];

        tbody += `
            <tr>
                <td><span class="party-dot" style="background:${color}"></span>${party}</td>
                <td>
                    <div class="vote-bar-wrap">
                        ${partyVotes.toLocaleString()}
                        <div class="vote-bar" style="width:${barWidth}px; background:${color}"></div>
                    </div>
                </td>
                <td style="font-family:var(--mono); font-size:0.82rem">${votePercent}%</td>
                <td><span class="seats-val">${seats}</span></td>
                <td style="font-family:var(--mono); font-size:0.82rem">${seatPercent}%</td>
                <td><span class="${diffClass}">${diffStr}</span></td>
            </tr>
        `;
    });

    document.getElementById('resultsBody').innerHTML = tbody;

    // Show results
    const section = document.getElementById('resultsSection');
    section.classList.remove('hidden');
    section.style.opacity = '0';
    section.style.transform = 'translateY(16px)';
    section.style.transition = 'opacity 0.4s, transform 0.4s';
    setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
    }, 30);

    // Scroll to results
    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ===================== CHART =====================
function renderChart(results, votes, parties, totalSeats) {
    const ctx = document.getElementById('resultsChart').getContext('2d');

    if (chartInstance) chartInstance.destroy();

    const colors = parties.map((_, i) => COLORS[i % COLORS.length]);

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: parties,
            datasets: [
                {
                    label: 'Seats Allocated',
                    data: parties.map(p => results[p]),
                    backgroundColor: colors.map(c => c + 'cc'),
                    borderColor: colors,
                    borderWidth: 1.5,
                    borderRadius: 4,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1e28',
                    borderColor: '#252a38',
                    borderWidth: 1,
                    titleColor: '#8892aa',
                    bodyColor: '#e8ecf4',
                    titleFont: { family: 'DM Mono', size: 11 },
                    bodyFont: { family: 'DM Mono', size: 12 },
                    padding: 12,
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => `  Seats: ${item.raw}  (${((item.raw / totalSeats) * 100).toFixed(1)}%)`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: '#252a38', drawBorder: false },
                    ticks: { color: '#8892aa', font: { family: 'DM Mono', size: 11 } }
                },
                y: {
                    grid: { color: '#252a38', drawBorder: false },
                    ticks: { color: '#8892aa', font: { family: 'DM Mono', size: 11 }, stepSize: 1 },
                    beginAtZero: true
                }
            }
        }
    });
}

// ===================== DOWNLOAD CSV =====================
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (!lastResults || !lastVotes) return;

    const totalVotes = Object.values(lastVotes).reduce((a, b) => a + b, 0);
    const totalSeats = Object.values(lastResults).reduce((a, b) => a + b, 0);

    let csv = 'Party,Votes,Vote %,Seats,Seat %,Difference\n';

    for (const [party, seats] of Object.entries(lastResults)) {
        const v = lastVotes[party];
        const vp = ((v / totalVotes) * 100).toFixed(2);
        const sp = ((seats / totalSeats) * 100).toFixed(2);
        const diff = (parseFloat(sp) - parseFloat(vp)).toFixed(2);
        csv += `${party},${v},${vp}%,${seats},${sp}%,${diff > 0 ? '+' : ''}${diff}%\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apportionment_results.csv';
    a.click();
    URL.revokeObjectURL(url);
});

// ===================== ERROR =====================
function showError(msg) {
    const existing = document.getElementById('errorToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'errorToast';
    toast.style.cssText = `
        position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
        background: #1a1e28; border: 1px solid #ff5f5f; color: #ff5f5f;
        font-family: 'DM Mono', monospace; font-size: 0.82rem;
        padding: 12px 24px; border-radius: 8px; z-index: 9999;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        animation: fadeUp 0.3s ease;
    `;
    toast.textContent = '⚠ ' + msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ Secure Apportionment System v2 loaded');
});
