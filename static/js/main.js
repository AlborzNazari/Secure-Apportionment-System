// Form submission handler
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('csvFile');
    const seatsInput = document.getElementById('totalSeats');
    
    if (!fileInput.files[0]) {
        alert('Please select a CSV file');
        return;
    }
    
    // Show loading spinner
    document.getElementById('loadingSpinner').classList.remove('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('seats', seatsInput.value);
    
    try {
        // Send to server
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayResults(data.results, data.votes);
            document.getElementById('loadingSpinner').classList.add('hidden');
            document.getElementById('resultsSection').classList.remove('hidden');
        } else {
            alert('Error: ' + data.error);
            document.getElementById('loadingSpinner').classList.add('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Check console for details.');
        document.getElementById('loadingSpinner').classList.add('hidden');
    }
});

// Display results
function displayResults(results, votes) {
    // Results table
    let resultsHTML = '<table><thead><tr><th>Party</th><th>Seats</th></tr></thead><tbody>';
    for (const [party, seats] of Object.entries(results)) {
        resultsHTML += `<tr><td>${party}</td><td><strong>${seats}</strong></td></tr>`;
    }
    resultsHTML += '</tbody></table>';
    document.getElementById('resultsTable').innerHTML = resultsHTML;
    
    // Fairness table
    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
    const totalSeats = Object.values(results).reduce((a, b) => a + b, 0);
    
    let fairnessHTML = '';
    for (const [party, seats] of Object.entries(results)) {
        const votePercent = ((votes[party] / totalVotes) * 100).toFixed(2);
        const seatPercent = ((seats / totalSeats) * 100).toFixed(2);
        const diff = (seatPercent - votePercent).toFixed(2);
        
        fairnessHTML += `
            <tr>
                <td>${party}</td>
                <td>${votePercent}%</td>
                <td>${seatPercent}%</td>
                <td style="${diff > 0 ? 'color: green' : 'color: red'}">${diff > 0 ? '+' : ''}${diff}%</td>
            </tr>
        `;
    }
    document.getElementById('fairnessBody').innerHTML = fairnessHTML;
}

// Download results
document.getElementById('downloadBtn')?.addEventListener('click', () => {
    alert('Download feature coming soon!');
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Secure Apportionment System loaded');
});
