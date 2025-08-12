// Initial array of quote objects
const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "The best way to predict the future is to invent it.", category: "Innovation" }
];

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes array from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    const parsedQuotes = JSON.parse(storedQuotes);
    quotes.length = 0; // Clear current quotes array
    quotes.push(...parsedQuotes);
  }
}

// Populate categories dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  // Clear all options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Add categories as options
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category from localStorage
  const lastCategory = localStorage.getItem('lastCategory') || 'all';
  categoryFilter.value = lastCategory;
}

// Filter and display quotes by selected category
function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  const selectedCategory = categoryFilter.value;

  // Save last selected category to localStorage
  localStorage.setItem('lastCategory', selectedCategory);

  const quoteDisplay = document.getElementById('quoteDisplay');

  // Filter quotes based on category or show all
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for category: ${selectedCategory}</p>`;
    return;
  }

  // Show a random quote from filtered list
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> ${quote.text}</p>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;

  // Store last quote index for this filtered list (optional)
  sessionStorage.setItem('lastQuoteIndex', randomIndex);
}

// Function to display a random quote from all quotes
function showRandomQuote() {
  // Reset category filter to 'all'
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.value = 'all';
  localStorage.setItem('lastCategory', 'all');

  const quoteDisplay = document.getElementById('quoteDisplay');
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> ${quote.text}</p>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;

  sessionStorage.setItem('lastQuoteIndex', randomIndex);
}

// Add a new quote and update categories dropdown
function addQuote() {
  const quoteTextInput = document.getElementById('newQuoteText');
  const quoteCategoryInput = document.getElementById('newQuoteCategory');

  const text = quoteTextInput.value.trim();
  const category = quoteCategoryInput.value.trim();

  if (text === '' || category === '') {
    alert('Please enter both a quote and a category.');
    return;
  }

  quotes.push({ text, category });

  saveQuotes();

  // Update categories dropdown if new category added
  populateCategories();

  // Automatically filter quotes by the new category and show a quote from it
  document.getElementById('categoryFilter').value = category;
  localStorage.setItem('lastCategory', category);
  filterQuotes();

  quoteTextInput.value = '';
  quoteCategoryInput.value = '';
}

// Export quotes as JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);

      if (!Array.isArray(importedQuotes)) {
        alert('Invalid JSON format: Expected an array.');
        return;
      }

      for (const q of importedQuotes) {
        if (typeof q.text !== 'string' || typeof q.category !== 'string') {
          alert('Invalid quote format in JSON.');
          return;
        }
      }

      quotes.push(...importedQuotes);
      saveQuotes();

      // Update categories dropdown and filter
      populateCategories();

      // Apply current filter (or default)
      filterQuotes();

      alert('Quotes imported successfully!');
    } catch (error) {
      alert('Failed to import JSON: ' + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Create and add the quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement('div');

  const quoteInput = document.createElement('input');
  quoteInput.id = 'newQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.id = 'addQuoteButton';
  addButton.textContent = 'Add Quote';

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);

  addButton.addEventListener('click', addQuote);
}

// Initialize the app on page load
window.onload = function() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  // Apply last selected filter and show filtered quote
  filterQuotes();

  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('exportButton').addEventListener('click', exportToJsonFile);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);

  // Add event listener for syncing local quotes to server
  const syncButton = document.createElement('button');
  syncButton.id = 'syncToServer';
  syncButton.textContent = 'Sync Local Quotes to Server';
  document.body.appendChild(syncButton);
  syncButton.addEventListener('click', postQuotesToServer);

  // Optional: Automatically sync every 5 minutes
  setInterval(syncQuotesWithServer, 300000); // Fetch server quotes every 5 minutes
  setInterval(postQuotesToServer, 300000);   // Post local quotes every 5 minutes
};

// === Step 1: Simulate Server Interaction ===

async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const serverData = await response.json();

    const serverQuotes = serverData.map(item => ({
      id: item.id.toString(),
      text: item.title,
      category: 'Server'  // Hardcoded category
    }));

    console.log('Fetched server quotes:', serverQuotes);
    return serverQuotes;
  } catch (error) {
    console.error('Failed to fetch server quotes:', error);
    return [];
  }
}

async function syncQuotesWithServer() {
  const serverQuotes = await fetchServerQuotes();

  // Check if any of these server quotes are new
  let addedCount = 0;
  const existingQuotesText = new Set(quotes.map(q => q.text));

  for (const quote of serverQuotes) {
    if (!existingQuotesText.has(quote.text)) {
      quotes.push(quote);
      addedCount++;
    }
  }

  if (addedCount > 0) {
    saveQuotes();
    populateCategories(); // In case new category added
    console.log(`${addedCount} new server quote(s) added.`);
    alert(`${addedCount} new quote(s) synced from the server.`);
    filterQuotes(); // Update UI with new quotes
  } else {
    console.log('No new server quotes to add.');
  }
}

// === Step 2: POST local quotes to server simulation ===
async function postQuotesToServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quotes)
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Quotes successfully posted to server:', responseData);
    alert('Local quotes synced to the server successfully!');
  } catch (error) {
    console.error('Failed to post quotes to server:', error);
    alert('Error syncing quotes to the server.');
  }
}
