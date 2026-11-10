// ============================================
// SECURE APPORTIONMENT SYSTEM — main.js v3
// Dataset library + scientific annotations
// ============================================

let chartInstance = null;
let lastResults = null;
let lastVotes = null;
let activeScenario = null;
let currentChartType = 'bar';

const COLORS = [
    '#4f9eff', '#7b61ff', '#3ecf8e', '#f5c842',
    '#ff5f5f', '#ff9f40', '#c084fc', '#34d399',
    '#fb923c', '#60a5fa', '#a78bfa', '#f472b6',
    '#38bdf8', '#4ade80', '#facc15', '#f87171'
];

// ============================================================
// EMBEDDED DATASETS
// All 11 scenarios pre-loaded — no file upload needed for demos
// ============================================================
const DATASETS = {
    basic: {
        name: 'Basic Proportional',
        seats: 100,
        theory: 'Proportional Representation',
        annotation: {
            title: 'Proportionality Benchmark',
            body: 'This is the baseline scenario. Vote shares are whole percentages of 100 seats, so every Δ is 0.00%: seat shares match vote shares exactly. Use it as a reference point for the other scenarios.'
        },
        csv: `Group,Votes
Party_A,390000
Party_B,280000
Party_C,200000
Party_D,130000`
    },

    proportional: {
        name: 'EU Degressive Proportionality',
        seats: 705,
        theory: 'Minimum-Seat Guarantee · Small Members',
        annotation: {
            title: 'EU-Style Model — 22 Member States',
            body: 'Malta has 120k of 61.9M votes, about 0.19%. That is an exact share of 1.37 seats out of 705, and Huntington-Hill gives it 1. Every state with votes starts with one seat, so no member can be left with none. The real European Parliament uses a different formula, with a minimum of 6 seats per state.'
        },
        csv: `Group,Votes
Germany,12500000
France,9800000
Italy,8700000
Spain,7200000
Poland,5400000
Netherlands,3100000
Belgium,2400000
Sweden,2100000
Austria,1900000
Denmark,1400000
Finland,1200000
Ireland,1100000
Portugal,1050000
Slovakia,890000
Croatia,780000
Lithuania,650000
Slovenia,420000
Latvia,380000
Estonia,310000
Cyprus,290000
Luxembourg,180000
Malta,120000`
    },

    condorcet: {
        name: 'Condorcet Winner',
        seats: 50,
        theory: 'Similar-Sized Parties',
        annotation: {
            title: 'Four Similar-Sized Parties',
            body: 'Party A leads with 34k of 100k votes; B, C and D have 21k to 23k each. Seat shares follow vote shares. Head-to-head (Condorcet) preferences cannot be read from vote totals, so this tool cannot check them.'
        },
        csv: `Group,Votes
Party_A,34000
Party_B,22000
Party_C,21000
Party_D,23000`
    },

    arrow: {
        name: "Arrow's Impossibility Stress Test",
        seats: 25,
        theory: 'Near-Ties · Rounding Stress Test',
        annotation: {
            title: 'Five Near-Equal Parties',
            body: 'All five parties sit within 400 votes of each other, and each gets 5 of the 25 seats. Moving 1,000 votes to or from any single party still leaves every party at 5. Try smaller seat counts to see where near-ties start to matter.'
        },
        csv: `Group,Votes
Liberal_Progressive,20200
Conservative_Alliance,19800
Green_Coalition,20100
Social_Democrats,19900
Libertarian_Front,20000`
    },

    runoff_round1: {
        name: 'Run-Off Round 1',
        seats: 200,
        theory: 'Two-Round System · 5% Sperrklausel Threshold',
        annotation: {
            title: 'Round 1 — Threshold Elimination',
            body: 'Total votes: 1,000,000. The 5% threshold is 50,000 votes. Reform Party (32k) and Agrarian Union (41k) fall below it and are eliminated. No party exceeds 50% majority — triggering a mandatory second round. Load Round 2 next to see how redistributed second-preference votes change the final seat allocation. The delta between Round 1 and Round 2 outputs is your run-off engine\'s core computation.'
        },
        csv: `Group,Votes
National_Front,310000
Social_Alliance,280000
Centre_Democrats,220000
Green_Bloc,117000
Reform_Party,32000
Agrarian_Union,41000`
    },

    runoff_round2: {
        name: 'Run-Off Round 2',
        seats: 200,
        theory: 'Second-Preference Redistribution · IRV Approximation',
        annotation: {
            title: 'Round 2 — Redistributed Vote Totals',
            body: 'Vote totals for the four remaining parties. Compared with Round 1, National Front gains 38.6k, Social Alliance 39.6k, Centre Democrats 36.6k and Green Bloc 14.6k. Compare the seat totals with Round 1 to see the effect.'
        },
        csv: `Group,Votes
National_Front,348600
Social_Alliance,319600
Centre_Democrats,256600
Green_Bloc,131600`
    },

    strategic: {
        name: 'Strategic Voting — Green Present',
        seats: 60,
        theory: 'Vote Splitting · Strategic Voting',
        annotation: {
            title: 'Green Party Present',
            body: 'Centre-Left gets 13 of 60 seats here. Load the Green-withdrawn version next: Green\'s 87k votes move to Centre-Left and Social Democrats, and Centre-Left rises to 17. The change comes from the moved votes, which is how vote splitting shapes results.'
        },
        csv: `Group,Votes
Conservative_Bloc,245000
Centre_Left,198000
Green_Party,87000
Nationalist_Union,170000
Social_Democrats,210000`
    },

    strategic_no_green: {
        name: 'Strategic Voting — Green Withdrawn',
        seats: 60,
        theory: 'Vote Transfer Model',
        annotation: {
            title: 'Green Party Withdrawn',
            body: 'Green Party\'s 87k votes are redistributed: 52,200 (60%) to Centre-Left and 34,800 (40%) to Social Democrats. Centre-Left rises from 13 to 17 seats and Social Democrats from 14 to 16. This is why small-party supporters are sometimes tempted to vote strategically.'
        },
        csv: `Group,Votes
Conservative_Bloc,245000
Centre_Left,250200
Nationalist_Union,170000
Social_Democrats,244800`
    },

    large: {
        name: 'National Election — UK Scale',
        seats: 650,
        theory: 'Scale · Performance',
        annotation: {
            title: '8.24M Ballots — Performance & Threshold Test',
            body: 'Twelve parties. 8,240,000 votes. 650 seats (UK House of Commons scale). In the project benchmark this takes about 0.17 ms: run time depends on parties and seats, not on how many votes there are. A 5% threshold (412k votes) would exclude seven of these parties; this tool applies none, so all twelve win seats.'
        },
        csv: `Group,Votes
Labour_Alliance,2180000
Conservative_Party,1950000
Liberal_Coalition,1420000
Green_Movement,680000
Scottish_National,520000
Reform_UK,410000
Welsh_Progressive,180000
Northern_Alliance,160000
Independents_Bloc,220000
Communist_Front,190000
Libertarian_Party,140000
Pirate_Party,190000`
    },

    alabama: {
        name: 'Alabama Paradox',
        seats: 25,
        theory: 'Alabama Paradox · House Monotonicity',
        annotation: {
            title: 'Alabama Paradox — Try 25 Seats, Then 26',
            body: 'Run with 25 seats, then 26. Under Hamilton\'s method, these votes give Party C 4 seats out of 25 but only 3 out of 26: the Alabama paradox, first noticed in 1880. Huntington-Hill keeps Party C at 4 in both. Balinski and Young (1982) proved that divisor methods like Huntington-Hill can never do this.'
        },
        csv: `Group,Votes
Party_A,525
Party_B,335
Party_C,140`
    },

    coalition: {
        name: 'Coalition Formation — Bundestag Model',
        seats: 598,
        theory: 'Coalition Arithmetic',
        annotation: {
            title: 'German Bundestag — Coalition Arithmetic',
            body: 'Majority: 300 of 598 seats. CDU/CSU + SPD get 318 seats, a majority; SPD + Greens + FDP get 292, short of one. A 5% threshold would exclude Ecological Front (98k) and Seniors\' Party (112k); this tool applies none, so they win 18 and 21 seats. Sainte-Laguë, the method used for the Bundestag, gives exactly the same seats on this data.'
        },
        csv: `Group,Votes
CDU_CSU,980000
SPD,720000
Greens,480000
FDP,360000
AfD,290000
Linke,160000
Ecological_Front,98000
Seniors_Party,112000`
    }
};

// ============================================================
// DATASET CARD INTERACTION
// ============================================================
document.querySelectorAll('.dataset-card').forEach(card => {
    card.addEventListener('click', () => {
        const scenario = card.dataset.scenario;
        const dataset = DATASETS[scenario];
        if (!dataset) return;

        // Mark active card
        document.querySelectorAll('.dataset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Load scenario
        loadScenario(scenario, dataset);

        // Scroll to upload panel
        document.querySelector('.main-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

function loadScenario(scenarioKey, dataset) {
    activeScenario = scenarioKey;

    // Show active banner
    document.getElementById('activeScenarioBanner').classList.remove('hidden');
    document.getElementById('scenarioBannerName').textContent = dataset.name;
    document.getElementById('scenarioBannerTheory').textContent = dataset.theory;

    // Set seat count
    document.getElementById('totalSeats').value = dataset.seats;

    // Create file from CSV string
    const blob = new Blob([dataset.csv], { type: 'text/csv' });
    const file = new File([blob], `${scenarioKey}.csv`, { type: 'text/csv' });

    // Inject into file input
    const dt = new DataTransfer();
    dt.items.add(file);
    document.getElementById('csvFile').files = dt.files;

    // Show file selected
    const fileSelected = document.getElementById('fileSelected');
    fileSelected.innerHTML = `✓ &nbsp;<strong>${file.name}</strong> &nbsp;(${formatBytes(file.size)})`;
    fileSelected.classList.remove('hidden');

    // Preview
    previewCSV(dataset.csv);
}

document.getElementById('clearScenario').addEventListener('click', () => {
    activeScenario = null;
    document.getElementById('activeScenarioBanner').classList.add('hidden');
    document.querySelectorAll('.dataset-card').forEach(c => c.classList.remove('active'));
    document.getElementById('csvFile').value = '';
    document.getElementById('fileSelected').classList.add('hidden');
    document.getElementById('csvPreview').classList.add('hidden');
    document.getElementById('totalSeats').value = 100;
});

// ============================================================
// FILE DRAG & DROP
// ============================================================
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
    if (file && file.name.endsWith('.csv')) setFile(file);
});

fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) setFile(fileInput.files[0]);
});

const FILENAME_MAP = {
    'sample_basic': 'basic',
    'sample_proportional': 'proportional',
    'sample_condorcet': 'condorcet',
    'sample_arrow': 'arrow',
    'sample_runoff_round1': 'runoff_round1',
    'sample_runoff_round2': 'runoff_round2',
    'sample_strategic_voting_no_green': 'strategic_no_green',
    'sample_strategic_voting': 'strategic',
    'sample_large_election': 'large',
    'sample_alabama_paradox': 'alabama',
    'sample_coalition': 'coalition'
};

function setFile(file) {
    fileSelected.innerHTML = `✓ &nbsp;<strong>${file.name}</strong> &nbsp;(${formatBytes(file.size)})`;
    fileSelected.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = (e) => previewCSV(e.target.result);
    reader.readAsText(file);

    const baseName = file.name.replace('.csv', '').toLowerCase().trim();
    const matched = FILENAME_MAP[baseName];

    if (matched && DATASETS[matched]) {
        activeScenario = matched;
        const dataset = DATASETS[matched];
        document.getElementById('activeScenarioBanner').classList.remove('hidden');
        document.getElementById('scenarioBannerName').textContent = dataset.name;
        document.getElementById('scenarioBannerTheory').textContent = dataset.theory;
        document.getElementById('totalSeats').value = dataset.seats;
        document.querySelectorAll('.dataset-card').forEach(c => {
            c.classList.toggle('active', c.dataset.scenario === matched);
        });
    } else {
        activeScenario = null;
        document.getElementById('activeScenarioBanner').classList.add('hidden');
        document.querySelectorAll('.dataset-card').forEach(c => c.classList.remove('active'));
    }
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

// ============================================================
// SEAT COUNTER
// ============================================================
document.getElementById('decreaseBtn').addEventListener('click', () => {
    const input = document.getElementById('totalSeats');
    if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
});

document.getElementById('increaseBtn').addEventListener('click', () => {
    const input = document.getElementById('totalSeats');
    if (parseInt(input.value) < 1000) input.value = parseInt(input.value) + 1;
});

// ============================================================
// FORM SUBMIT
// ============================================================
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) { showError('Please select a CSV file or choose a scenario above.'); return; }

    const seats = parseInt(document.getElementById('totalSeats').value);
    if (!seats || seats < 1) { showError('Please enter a valid seat count.'); return; }

    document.getElementById('loadingSpinner').classList.remove('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('submitBtn').disabled = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('seats', seats);

    try {
        const response = await fetch('/upload', { method: 'POST', body: formData });
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
        showError('Could not connect to server. Is Flask running on port 5000?');
        console.error(err);
    }
});

// ============================================================
// DISPLAY RESULTS
// ============================================================
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

    // Scientific annotation
    if (activeScenario && DATASETS[activeScenario]) {
        const ann = DATASETS[activeScenario].annotation;
        document.getElementById('annotationTitle').textContent = ann.title;
        document.getElementById('annotationBody').textContent = ann.body;
        document.getElementById('scenarioAnnotation').classList.remove('hidden');
    } else {
        document.getElementById('scenarioAnnotation').classList.add('hidden');
    }

    // Chart
    currentChartType = 'bar';
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-chart="bar"]').classList.add('active');
    renderChart(results, votes, parties, totalSeats, 'bar');

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

    const section = document.getElementById('resultsSection');
    section.classList.remove('hidden');
    section.style.opacity = '0';
    section.style.transform = 'translateY(16px)';
    section.style.transition = 'opacity 0.4s, transform 0.4s';
    setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
    }, 30);

    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ============================================================
// CHART TABS
// ============================================================
document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        if (!lastResults || !lastVotes) return;
        document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentChartType = tab.dataset.chart;
        const parties = Object.keys(lastResults);
        const totalSeats = Object.values(lastResults).reduce((a, b) => a + b, 0);
        renderChart(lastResults, lastVotes, parties, totalSeats, currentChartType);
    });
});

// ============================================================
// CHART RENDERER
// ============================================================
function renderChart(results, votes, parties, totalSeats, chartType) {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const colors = parties.map((_, i) => COLORS[i % COLORS.length]);
    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

    if (chartType === 'bar') {
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: parties,
                datasets: [{
                    label: 'Seats Allocated',
                    data: parties.map(p => results[p]),
                    backgroundColor: colors.map(c => c + 'cc'),
                    borderColor: colors,
                    borderWidth: 1.5,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: chartOptions(totalSeats, (items) => `  Seats: ${items[0].raw}  (${((items[0].raw / totalSeats) * 100).toFixed(1)}%)`)
        });

    } else if (chartType === 'doughnut') {
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: parties,
                datasets: [{
                    data: parties.map(p => results[p]),
                    backgroundColor: colors.map(c => c + 'cc'),
                    borderColor: colors,
                    borderWidth: 1.5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                animation: { duration: 800, easing: 'easeOutQuart' },
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: '#8892aa',
                            font: { family: 'DM Mono', size: 10 },
                            boxWidth: 10,
                            padding: 12
                        }
                    },
                    tooltip: tooltipConfig((item) => `  ${item.label}: ${item.raw} seats (${((item.raw / totalSeats) * 100).toFixed(1)}%)`)
                }
            }
        });

    } else if (chartType === 'delta') {
        // Deviation chart: seat% minus vote%
        const deltas = parties.map(p => {
            const sp = (results[p] / totalSeats) * 100;
            const vp = (votes[p] / totalVotes) * 100;
            return parseFloat((sp - vp).toFixed(2));
        });

        const deltaColors = deltas.map(d =>
            d > 0.5 ? '#3ecf8ecc' : d < -0.5 ? '#ff5f5fcc' : '#8892aacc'
        );

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: parties,
                datasets: [{
                    label: 'Seat% − Vote% Deviation',
                    data: deltas,
                    backgroundColor: deltaColors,
                    borderColor: deltaColors.map(c => c.slice(0, 7)),
                    borderWidth: 1.5,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                ...chartOptions(totalSeats, (items) => `  Δ: ${items[0].raw > 0 ? '+' : ''}${items[0].raw}%`),
                scales: {
                    x: {
                        grid: { color: '#252a38', drawBorder: false },
                        ticks: { color: '#8892aa', font: { family: 'DM Mono', size: 11 } }
                    },
                    y: {
                        grid: { color: '#252a38', drawBorder: false },
                        ticks: {
                            color: '#8892aa',
                            font: { family: 'DM Mono', size: 11 },
                            callback: (v) => (v > 0 ? '+' : '') + v + '%'
                        }
                    }
                }
            }
        });
    }
}

function chartOptions(totalSeats, labelCb) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: {
            legend: { display: false },
            tooltip: tooltipConfig((items) => labelCb(items))
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
    };
}

function tooltipConfig(labelCb) {
    return {
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
            label: labelCb
        }
    };
}

// ============================================================
// DOWNLOAD CSV
// ============================================================
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
    a.download = `apportionment_${activeScenario || 'results'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
});

// ============================================================
// ERROR TOAST
// ============================================================
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

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ Secure Apportionment System v3 loaded — 11 scenarios ready');
});
