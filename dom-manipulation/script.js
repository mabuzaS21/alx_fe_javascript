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

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> ${quote.text}</p>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;

  // Optional: Store last quote index in sessionStorage
  sessionStorage.setItem('lastQuoteIndex', randomIndex);
}

// Function to add a new quote
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

  saveQuotes(); // Save updated quotes to localStorage

  showRandomQuote();

  quoteTextInput.value = '';
  quoteCategoryInput.value = '';
}

// Function to export quotes as a JSON file
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

// Function to import quotes from a JSON file
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
      alert('Quotes imported successfully!');
      showRandomQuote();
    } catch (error) {
      alert('Failed to import JSON: ' + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to create and add the quote form (dynamically)
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

// Setup app on page load
window.onload = function() {
  loadQuotes();
  createAddQuoteForm();
  showRandomQuote();

  // Attach event listeners to static HTML buttons
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('exportButton').addEventListener('click', exportToJsonFile);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
};
