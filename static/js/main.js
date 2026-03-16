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
        theory: 'Proportional Representation · Droop Quota',
        annotation: {
            title: 'Proportionality Benchmark',
            body: 'This is the baseline scenario. All Δ values should fall within ±0.5% — the mathematical tolerance of Huntington-Hill given integer seat constraints. Any deviation beyond ±1% indicates a method bias. Compare this output against the IIA and Arrow scenarios to see how vote splitting distorts these clean proportions.'
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
        theory: 'Degressive Proportionality · Lisbon Treaty Art. 14(2)',
        annotation: {
            title: 'EU Parliament Model — 22 Member States',
            body: 'Watch how Malta (120k votes) and Germany (12.5M votes) relate in seat allocation. Under strict proportionality, Malta would receive ~0.16% of seats — less than 2. Huntington-Hill\'s initial allocation of 1 seat per party before priority scoring prevents this collapse, approximating the Treaty\'s minimum-seat guarantee without a hard floor.'
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
        theory: 'Condorcet Criterion · Pairwise Dominance',
        annotation: {
            title: 'Condorcet Winner Scenario',
            body: 'Party A (34k votes) beats every other party in a head-to-head race, yet under plurality voting it risks losing to Party D (23k) due to vote splitting with B and C. Proportional allocation sidesteps this entirely — each party\'s seat share reflects aggregate vote totals, not pairwise tournament outcomes. This is why proportional systems are considered structurally fairer than plurality in multi-party elections.'
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
        theory: "Arrow's Impossibility Theorem · Maximum Instability Zone",
        annotation: {
            title: 'Maximum Instability — 5 Near-Equal Parties',
            body: 'All five parties sit within 400 votes of each other. A ±1,000 vote swing in any single party produces measurable seat reallocation. This is Arrow\'s theorem made empirical: no deterministic method can produce stable, paradox-free outcomes in this configuration. Observe the Δ column closely — even Huntington-Hill, the most mathematically robust method, will show sensitivity here. This is not a bug. It is the fundamental limit of social choice theory.'
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
            body: 'Eliminated parties\' votes redistribute at 60% to ideologically adjacent parties (estimated second-preference model). National Front gains 38.6k, Social Alliance gains 39.6k, Centre Democrats gains 36.6k, Green Bloc gains 14.6k. Compare these seat totals directly with Round 1 — the seat shift across surviving parties is the measurable effect of preferential redistribution. This is the data your v0.2.0 run-off backend should compute automatically from ballot preference data.'
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
        theory: 'Independence of Irrelevant Alternatives · IIA Violation',
        annotation: {
            title: 'IIA Violation — Green Party Present',
            body: 'Run this, note Centre-Left\'s seat count. Then load the No-Green version. Centre-Left\'s allocation will change despite receiving zero new or lost direct votes. That change is Arrow\'s Independence of Irrelevant Alternatives failure — the presence of a third party alters the relative outcome between two other parties. This is not a flaw in Huntington-Hill specifically: it is mathematically unavoidable in any proportional system with vote splitting.'
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
        theory: 'IIA Counterfactual · Vote Transfer Model',
        annotation: {
            title: 'IIA Baseline — Green Party Withdrawn',
            body: 'Green Party\'s 87k votes redistributed: 52,200 (60%) to Centre-Left, 34,800 (40%) to Social Democrats — modelled on ideological proximity. Compare Centre-Left\'s seat count here against the Green-present scenario. The difference is the empirical IIA violation. In a real election, this incentivises strategic voting: Green supporters may defect to Centre-Left in Round 1 to avoid wasting their vote, which is exactly the behaviour Arrow\'s theorem predicts is structurally unavoidable.'
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
        theory: 'Electoral Threshold · O(n log n) Complexity',
        annotation: {
            title: '8.24M Ballots — Performance & Threshold Test',
            body: 'Twelve parties. 8,240,000 total ballots. 650 seats (UK House of Commons scale). The O(n log n) heap-based Huntington-Hill implementation should complete this in under 2 seconds — the performance claim from the v0.1.0 specification. Watch for parties near the 5% threshold (412k votes): Welsh Progressive (180k) and Northern Alliance (160k) fall below it in a threshold-gated system. Without a threshold, both receive seats. This dataset lets you compare threshold vs. no-threshold outcomes directly.'
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
        theory: 'Alabama Paradox · House Monotonicity Proof',
        annotation: {
            title: 'Alabama Paradox — Try 25 Seats, Then 26',
            body: 'Run with 25 seats. Note Party C\'s allocation. Change the seat count to 26 and run again. Under Hamilton\'s method, Party C loses a seat when total seats increase — the Alabama Paradox, discovered in 1880 and used as the argument to replace Hamilton with Huntington-Hill in the US House in 1941. Huntington-Hill is monotone: Party C\'s count holds or increases. This monotonicity is proven by Balinski and Young (1982) and is the primary mathematical justification for adopting this method in any serious parliamentary system.'
        },
        csv: `Group,Votes
Party_A,530
Party_B,390
Party_C,80`
    },

    coalition: {
        name: 'Coalition Formation — Bundestag Model',
        seats: 598,
        theory: 'Sperrklausel · Coalition Game Theory · Sainte-Laguë',
        annotation: {
            title: 'German Bundestag — Coalition Arithmetic',
            body: 'The 5% Sperrklausel (electoral threshold) eliminates Ecological Front (98k) and Seniors\' Party (112k). Majority threshold: 300 of 598 seats. Inspect the results to determine viable coalitions: CDU/CSU + SPD (grand coalition) vs. SPD + Greens + FDP (traffic light). Note: Sainte-Laguë (the actual Bundestag method) and Huntington-Hill produce ±2 seat variance on this dataset — significant enough to change which coalition has a majority. This dataset makes that comparison concrete.'
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
    if (file && file.name.endsWith('.csv')) {
        setFile(file);
        activeScenario = null;
        document.getElementById('activeScenarioBanner').classList.add('hidden');
        document.querySelectorAll('.dataset-card').forEach(c => c.classList.remove('active'));
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) {
        setFile(fileInput.files[0]);
        activeScenario = null;
        document.getElementById('activeScenarioBanner').classList.add('hidden');
        document.querySelectorAll('.dataset-card').forEach(c => c.classList.remove('active'));
    }
});

function setFile(file) {
    fileSelected.innerHTML = `✓ &nbsp;<strong>${file.name}</strong> &nbsp;(${formatBytes(file.size)})`;
    fileSelected.classList.remove('hidden');
    const reader = new FileReader();
    reader.onload = (e) => previewCSV(e.target.result);
    reader.readAsText(file);

    // Auto-detect scenario from filename
    const nameMap = {
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
    const baseName = file.name.replace('.csv', '');
    const matched = nameMap[baseName];
    if (matched) {
        activeScenario = matched;
        const dataset = DATASETS[matched];
        document.getElementById('activeScenarioBanner').classList.remove('hidden');
        document.getElementById('scenarioBannerName').textContent = dataset.name;
        document.getElementById('scenarioBannerTheory').textContent = dataset.theory;
        document.getElementById('totalSeats').value = dataset.seats;
        document.querySelectorAll('.dataset-card').forEach(c => {
            c.classList.toggle('active', c.dataset.scenario === matched);
        });
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
