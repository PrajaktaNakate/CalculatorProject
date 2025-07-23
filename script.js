// Modern Calculator JS

document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('calc-display');
  const buttons = document.querySelectorAll('.btn');
  const historyList = document.getElementById('history-list');
  const clearBtn = document.getElementById('clear');
  const backspaceBtn = document.getElementById('backspace');
  const equalsBtn = document.getElementById('equals');
  const clearHistoryBtn = document.getElementById('clear-history');

  let currentInput = '';
  let history = [];

  // Load history from localStorage
  function loadHistory() {
    const stored = localStorage.getItem('calc_history');
    if (stored) {
      try {
        history = JSON.parse(stored);
      } catch (e) {
        history = [];
      }
    } else {
      history = [];
    }
    renderHistory();
  }

  // Save history to localStorage
  function saveHistory() {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }

  // Render history in the panel
  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No history yet.';
      li.style.color = '#888';
      historyList.appendChild(li);
      return;
    }
    history.slice(0, 20).forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.expr} = ${item.result}`;
      historyList.appendChild(li);
    });
  }

  // Evaluate the current input and update display, history, and localStorage
  function evaluateExpression() {
    let expression = currentInput;
    let result = '';
    try {
      // Replace symbols for JS eval
      expression = expression.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
      // Replace constants
      expression = expression.replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E');
      // Replace scientific functions
      expression = expression.replace(/sin\(/g, 'Math.sin(')
                             .replace(/cos\(/g, 'Math.cos(')
                             .replace(/tan\(/g, 'Math.tan(')
                             .replace(/log\(/g, 'Math.log10(')
                             .replace(/√/g, 'Math.sqrt');
      // Replace xʸ with Math.pow
      expression = expression.replace(/(\d+(?:\.\d+)?)\s*xʸ\s*(\d+(?:\.\d+)?)/g, 'Math.pow($1,$2)');
      // Evaluate
      result = eval(expression);
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        display.value = result;
        // Add to history
        history.unshift({ expr: currentInput, result: result });
        if (history.length > 20) history.pop();
        saveHistory();
        renderHistory();
        currentInput = result.toString();
      } else {
        display.value = 'Error';
        setTimeout(() => { display.value = ''; }, 1000);
      }
    } catch (e) {
      display.value = 'Error';
      setTimeout(() => { display.value = ''; }, 1000);
    }
  }

  // --- Memory Functionality ---
  let memory = 0;

  // Handle scientific functions
  function handleFunction(func) {
    switch (func) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'log':
        currentInput += func + '(';
        break;
      case 'sqrt':
        currentInput += '√(';
        break;
      case 'pow':
        currentInput += ' xʸ ';
        break;
      case 'pi':
        currentInput += 'π';
        break;
      case 'e':
        currentInput += 'e';
        break;
      case 'percent':
        // Calculate percent of current input
        try {
          let val = eval(currentInput.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-').replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E'));
          if (!isNaN(val)) {
            val = val / 100;
            display.value = val;
            currentInput = val.toString();
          }
        } catch (e) {
          display.value = 'Error';
          setTimeout(() => { display.value = ''; }, 1000);
        }
        break;
      case 'mc':
        memory = 0;
        break;
      case 'mr':
        currentInput += memory.toString();
        display.value = currentInput;
        break;
      case 'mplus':
        try {
          let val = eval(currentInput.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-').replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E'));
          if (!isNaN(val)) memory += val;
        } catch (e) {}
        break;
      case 'mminus':
        try {
          let val = eval(currentInput.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-').replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E'));
          if (!isNaN(val)) memory -= val;
        } catch (e) {}
        break;
      default:
        break;
    }
    if (!['percent', 'mr', 'mc', 'mplus', 'mminus'].includes(func)) {
      display.value = currentInput;
    }
  }

  // Handle button clicks
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const value = btn.getAttribute('data-value');
      const operator = btn.getAttribute('data-operator');
      const func = btn.getAttribute('data-func');

      if (value !== null) {
        currentInput += value;
        display.value = currentInput;
      } else if (operator !== null) {
        currentInput += ' ' + operator + ' ';
        display.value = currentInput;
      } else if (func !== null) {
        handleFunction(func);
      }
    });
  });

  // Handle clear
  clearBtn.addEventListener('click', () => {
    currentInput = '';
    display.value = '';
  });

  // Handle backspace
  backspaceBtn.addEventListener('click', () => {
    currentInput = currentInput.trimEnd();
    if (currentInput.endsWith(' ')) {
      currentInput = currentInput.slice(0, -3);
    } else {
      currentInput = currentInput.slice(0, -1);
    }
    display.value = currentInput;
  });

  // Handle equals
  equalsBtn.addEventListener('click', () => {
    evaluateExpression();
  });

  // Handle clear history
  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    saveHistory();
    renderHistory();
  });

  // Tab switching logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      document.getElementById(tab + '-tab').classList.add('active');
    });
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if ((key >= '0' && key <= '9') || key === '.') {
      currentInput += key;
      display.value = currentInput;
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '(' || key === ')') {
      // Map * and / to × and ÷ for display
      if (key === '*') {
        currentInput += ' × ';
      } else if (key === '/') {
        currentInput += ' ÷ ';
      } else if (key === '-') {
        currentInput += ' − ';
      } else if (key === '+') {
        currentInput += ' + ';
      } else {
        currentInput += key;
      }
      display.value = currentInput;
    } else if (key === 'Enter' || key === '=') {
      evaluateExpression();
    } else if (key === 'Backspace') {
      currentInput = currentInput.trimEnd();
      if (currentInput.endsWith(' ')) {
        currentInput = currentInput.slice(0, -3);
      } else {
        currentInput = currentInput.slice(0, -1);
      }
      display.value = currentInput;
    } else if (key.toLowerCase() === 'c' || key === 'Escape') {
      currentInput = '';
      display.value = '';
    } else if (key.toLowerCase() === 's') {
      currentInput += 'sin('; display.value = currentInput;
    } else if (key.toLowerCase() === 'o') {
      currentInput += 'cos('; display.value = currentInput;
    } else if (key.toLowerCase() === 't') {
      currentInput += 'tan('; display.value = currentInput;
    } else if (key.toLowerCase() === 'l') {
      currentInput += 'log('; display.value = currentInput;
    } else if (key === '^') {
      currentInput += ' xʸ '; display.value = currentInput;
    } else if (key === 'p') {
      currentInput += 'π'; display.value = currentInput;
    } else if (key === 'e') {
      currentInput += 'e'; display.value = currentInput;
    } else if (key === 'r') {
      currentInput += '√('; display.value = currentInput;
    }
  });

  // --- Unit Converter Logic ---
  const unitCategory = document.getElementById('unit-category');
  const unitFrom = document.getElementById('unit-from');
  const unitTo = document.getElementById('unit-to');
  const unitInput = document.getElementById('unit-input');
  const unitOutput = document.getElementById('unit-output');
  const unitConvertBtn = document.getElementById('unit-convert-btn');

  const unitOptions = {
    length: [
      { value: 'mm', label: 'Millimeter (mm)' },
      { value: 'cm', label: 'Centimeter (cm)' },
      { value: 'm', label: 'Meter (m)' },
      { value: 'km', label: 'Kilometer (km)' },
      { value: 'in', label: 'Inch (in)' },
      { value: 'ft', label: 'Foot (ft)' },
      { value: 'yd', label: 'Yard (yd)' },
      { value: 'mi', label: 'Mile (mi)' }
    ],
    weight: [
      { value: 'mg', label: 'Milligram (mg)' },
      { value: 'g', label: 'Gram (g)' },
      { value: 'kg', label: 'Kilogram (kg)' },
      { value: 't', label: 'Metric Ton (t)' },
      { value: 'oz', label: 'Ounce (oz)' },
      { value: 'lb', label: 'Pound (lb)' },
      { value: 'st', label: 'Stone (st)' }
    ],
    temperature: [
      { value: 'c', label: 'Celsius (°C)' },
      { value: 'f', label: 'Fahrenheit (°F)' },
      { value: 'k', label: 'Kelvin (K)' }
    ]
  };

  const lengthFactors = {
    mm: 1,
    cm: 10,
    m: 1000,
    km: 1000000,
    in: 25.4,
    ft: 304.8,
    yd: 914.4,
    mi: 1609344
  };
  const weightFactors = {
    mg: 1,
    g: 1000,
    kg: 1000000,
    t: 1000000000,
    oz: 28349.5,
    lb: 453592,
    st: 6350290
  };

  function populateUnitDropdowns(category) {
    unitFrom.innerHTML = '';
    unitTo.innerHTML = '';
    unitOptions[category].forEach(opt => {
      const option1 = document.createElement('option');
      option1.value = opt.value;
      option1.textContent = opt.label;
      unitFrom.appendChild(option1);
      const option2 = document.createElement('option');
      option2.value = opt.value;
      option2.textContent = opt.label;
      unitTo.appendChild(option2);
    });
    unitTo.selectedIndex = 1;
  }

  unitCategory.addEventListener('change', () => {
    populateUnitDropdowns(unitCategory.value);
    unitInput.value = '';
    unitOutput.value = '';
  });

  function convertUnit() {
    const category = unitCategory.value;
    const from = unitFrom.value;
    const to = unitTo.value;
    const input = parseFloat(unitInput.value);
    if (isNaN(input)) {
      unitOutput.value = '';
      return;
    }
    let result = 0;
    if (category === 'length') {
      // Convert to mm, then to target
      const inMm = input * lengthFactors[from];
      result = inMm / lengthFactors[to];
    } else if (category === 'weight') {
      // Convert to mg, then to target
      const inMg = input * weightFactors[from];
      result = inMg / weightFactors[to];
    } else if (category === 'temperature') {
      // Convert to Celsius first
      let celsius;
      if (from === 'c') celsius = input;
      else if (from === 'f') celsius = (input - 32) * 5 / 9;
      else if (from === 'k') celsius = input - 273.15;
      // Convert from Celsius to target
      if (to === 'c') result = celsius;
      else if (to === 'f') result = (celsius * 9 / 5) + 32;
      else if (to === 'k') result = celsius + 273.15;
    }
    unitOutput.value = isNaN(result) ? '' : result.toFixed(6).replace(/\.0+$/, '');
  }

  unitConvertBtn.addEventListener('click', convertUnit);

  // Initialize on load
  if (unitCategory && unitFrom && unitTo) {
    populateUnitDropdowns(unitCategory.value);
  }

  // --- Currency Converter Logic ---
  const currencyFrom = document.getElementById('currency-from');
  const currencyTo = document.getElementById('currency-to');
  const currencyInput = document.getElementById('currency-input');
  const currencyOutput = document.getElementById('currency-output');
  const currencyConvertBtn = document.getElementById('currency-convert-btn');

  const currencyList = [
    { value: 'USD', label: 'USD (US Dollar)' },
    { value: 'EUR', label: 'EUR (Euro)' },
    { value: 'GBP', label: 'GBP (British Pound)' },
    { value: 'JPY', label: 'JPY (Japanese Yen)' },
    { value: 'INR', label: 'INR (Indian Rupee)' },
    { value: 'CAD', label: 'CAD (Canadian Dollar)' },
    { value: 'AUD', label: 'AUD (Australian Dollar)' },
    { value: 'CNY', label: 'CNY (Chinese Yuan)' }
  ];

  // Demo rates: 1 unit of key = value in target
  const currencyRates = {
    USD: { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 155.2, INR: 83.1, CAD: 1.36, AUD: 1.52, CNY: 7.23 },
    EUR: { USD: 1.09, EUR: 1, GBP: 0.86, JPY: 168.5, INR: 90.2, CAD: 1.48, AUD: 1.65, CNY: 7.87 },
    GBP: { USD: 1.27, EUR: 1.16, GBP: 1, JPY: 196.2, INR: 104.7, CAD: 1.72, AUD: 1.92, CNY: 9.13 },
    JPY: { USD: 0.0064, EUR: 0.0059, GBP: 0.0051, JPY: 1, INR: 0.53, CAD: 0.0088, AUD: 0.0098, CNY: 0.047 },
    INR: { USD: 0.012, EUR: 0.011, GBP: 0.0096, JPY: 1.89, INR: 1, CAD: 0.016, AUD: 0.018, CNY: 0.087 },
    CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 113.8, INR: 61.7, CAD: 1, AUD: 1.12, CNY: 5.32 },
    AUD: { USD: 0.66, EUR: 0.61, GBP: 0.52, JPY: 101.7, INR: 54.9, CAD: 0.89, AUD: 1, CNY: 4.75 },
    CNY: { USD: 0.14, EUR: 0.13, GBP: 0.11, JPY: 21.4, INR: 11.5, CAD: 0.19, AUD: 0.21, CNY: 1 }
  };

  function populateCurrencyDropdowns() {
    currencyFrom.innerHTML = '';
    currencyTo.innerHTML = '';
    currencyList.forEach(opt => {
      const option1 = document.createElement('option');
      option1.value = opt.value;
      option1.textContent = opt.label;
      currencyFrom.appendChild(option1);
      const option2 = document.createElement('option');
      option2.value = opt.value;
      option2.textContent = opt.label;
      currencyTo.appendChild(option2);
    });
    currencyTo.selectedIndex = 1;
  }

  function convertCurrency() {
    const from = currencyFrom.value;
    const to = currencyTo.value;
    const input = parseFloat(currencyInput.value);
    if (isNaN(input)) {
      currencyOutput.value = '';
      return;
    }
    const rate = currencyRates[from][to];
    const result = input * rate;
    currencyOutput.value = isNaN(result) ? '' : result.toFixed(4).replace(/\.0+$/, '');
  }

  currencyConvertBtn.addEventListener('click', convertCurrency);

  // Initialize on load
  if (currencyFrom && currencyTo) {
    populateCurrencyDropdowns();
  }

  // --- Theme Switcher Logic ---
  const themeSwitcher = document.getElementById('theme-switcher');
  const themeClasses = ['theme-default', 'theme-dark', 'theme-animated'];
  function applyTheme(theme) {
    document.body.classList.remove('theme-default', 'theme-dark', 'theme-animated');
    const lottieBg = document.getElementById('animated-bg-lottie');
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
      if (lottieBg) lottieBg.style.display = 'none';
    } else if (theme === 'animated') {
      document.body.classList.add('theme-animated');
      if (lottieBg) lottieBg.style.display = 'block';
    } else {
      document.body.classList.add('theme-default');
      if (lottieBg) lottieBg.style.display = 'none';
    }
    localStorage.setItem('calc_theme', theme);
  }
  if (themeSwitcher) {
    themeSwitcher.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
  }
  // On load, set theme from localStorage
  const savedTheme = localStorage.getItem('calc_theme') || 'default';
  themeSwitcher && (themeSwitcher.value = savedTheme);
  applyTheme(savedTheme);

  // --- Theme Toggle Button Logic ---
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  function setActiveThemeBtn(theme) {
    themeToggleBtns.forEach(btn => {
      if (btn.getAttribute('data-theme') === theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      setActiveThemeBtn(theme);
      applyTheme(theme);
    });
  });
  // On load, set active button
  setActiveThemeBtn(savedTheme);

  // Initial render
  display.value = '';
  loadHistory();
});