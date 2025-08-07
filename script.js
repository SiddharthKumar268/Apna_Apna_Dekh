var amountInput = document.getElementById('amount');
var peopleInput = document.getElementById('people');
var tipInput = document.getElementById('tip');
var namesInput = document.getElementById('names');
var individualTipsCheckbox = document.getElementById('individualTips');
var tipsPerPersonInput = document.getElementById('tipsPerPerson');
var tipsPerPersonLabel = document.getElementById('tipsPerPersonLabel');

var splitBtn = document.getElementById('splitBtn');
var resetBtn = document.getElementById('resetBtn');
var copyBtn = document.getElementById('copyBtn');
var downloadBtn = document.getElementById('downloadBtn');
var darkModeToggle = document.getElementById('darkModeToggle');
var devBtn = document.getElementById('devBtn');

var resultBox = document.getElementById('result');
var chartCanvas = document.getElementById('chart');
var chartInstance = null;

var amountError = document.getElementById('amount-error');
var peopleError = document.getElementById('people-error');
var tipError = document.getElementById('tip-error');
var namesError = document.getElementById('names-error');
var tipsPerPersonError = document.getElementById('tipsPerPerson-error');

individualTipsCheckbox.addEventListener('change', function() {
  if (individualTipsCheckbox.checked) {
    tipsPerPersonInput.style.display = 'block';
    tipsPerPersonLabel.style.display = 'block';
  } else {
    tipsPerPersonInput.style.display = 'none';
    tipsPerPersonLabel.style.display = 'none';
    tipsPerPersonInput.value = '';
    tipsPerPersonError.textContent = '';
  }
});

function clearErrors() {
  amountError.textContent = '';
  peopleError.textContent = '';
  tipError.textContent = '';
  namesError.textContent = '';
  tipsPerPersonError.textContent = '';
}

function validateInputs() {
  clearErrors();
  var valid = true;

  var amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount < 0) {
    amountError.textContent = 'Please enter a valid amount ≥ 0.';
    valid = false;
  }

  var people = parseInt(peopleInput.value, 10);
  if (isNaN(people) || people < 1) {
    peopleError.textContent = 'Please enter at least 1 person.';
    valid = false;
  }

  if (!individualTipsCheckbox.checked) {
    var tip = tipInput.value.trim();
    if (tip !== '') {
      var tipNum = parseFloat(tip);
      if (isNaN(tipNum) || tipNum < 0) {
        tipError.textContent = 'Tip percentage must be ≥ 0.';
        valid = false;
      }
    }
  } else {
    var tips = tipsPerPersonInput.value.trim();
    if (tips === '') {
      tipsPerPersonError.textContent = 'Please enter tips per person.';
      valid = false;
    } else {
      var tipsArr = tips.split(',');
      if (tipsArr.length !== people) {
        tipsPerPersonError.textContent = 'Tips count must match number of people.';
        valid = false;
      } else {
        for (var i = 0; i < tipsArr.length; i++) {
          var tipVal = parseFloat(tipsArr[i].trim());
          if (isNaN(tipVal) || tipVal < 0) {
            tipsPerPersonError.textContent = 'All tips must be valid numbers ≥ 0.';
            valid = false;
            break;
          }
        }
      }
    }
  }

  var names = namesInput.value.trim();
  if (names !== '') {
    var namesArr = names.split(',');
    if (namesArr.length !== people) {
      namesError.textContent = 'Names count must match number of people.';
      valid = false;
    }
  }

  return valid;
}

function calculateSplit() {
  if (!validateInputs()) {
    resultBox.textContent = '';
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  var amount = parseFloat(amountInput.value);
  var people = parseInt(peopleInput.value, 10);
  var namesArr = [];
  if (namesInput.value.trim() !== '') {
    namesArr = namesInput.value.split(',').map(function(n) { return n.trim(); });
  } else {
    for (var i = 1; i <= people; i++) {
      namesArr.push('Person ' + i);
    }
  }

  var tipsArr = [];
  if (individualTipsCheckbox.checked) {
    tipsArr = tipsPerPersonInput.value.split(',').map(function(t) { return parseFloat(t.trim()); });
  } else {
    var tipPercent = tipInput.value.trim() === '' ? 0 : parseFloat(tipInput.value);
    for (var j = 0; j < people; j++) {
      tipsArr.push(tipPercent);
    }
  }

  var totalAmounts = [];
  var totalSum = 0;

  for (var k = 0; k < people; k++) {
    var baseShare = amount / people;
    var tipAmount = baseShare * (tipsArr[k] / 100);
    var total = baseShare + tipAmount;
    totalAmounts.push(total);
    totalSum += total;
  }

  var totalTip = totalSum - amount;

  var resultText = 'Total Amount: ' + amount.toFixed(2) + '\n';
  resultText += 'Total Tip: ' + totalTip.toFixed(2) + '\n\n';

  for (var m = 0; m < people; m++) {
    resultText += namesArr[m] + ': ' + totalAmounts[m].toFixed(2) + ' (Tip ' + tipsArr[m].toFixed(2) + '%)\n';
  }

  resultBox.textContent = resultText;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels: namesArr,
      datasets: [{
        data: totalAmounts,
        backgroundColor: generateColors(people)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Expense Split'
        }
      }
    }
  });
}

function generateColors(num) {
  var colors = [];
  for (var i = 0; i < num; i++) {
    var hue = Math.floor((360 / num) * i);
    colors.push('hsl(' + hue + ', 70%, 60%)');
  }
  return colors;
}

splitBtn.addEventListener('click', calculateSplit);

resetBtn.addEventListener('click', function() {
  amountInput.value = '';
  peopleInput.value = '';
  tipInput.value = '';
  namesInput.value = '';
  individualTipsCheckbox.checked = false;
  tipsPerPersonInput.value = '';
  tipsPerPersonInput.style.display = 'none';
  tipsPerPersonLabel.style.display = 'none';

  clearErrors();
  resultBox.textContent = '';
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});

copyBtn.addEventListener('click', function() {
  var text = resultBox.textContent;
  if (text.trim() !== '') {
    navigator.clipboard.writeText(text);
    alert('Result copied to clipboard');
  }
});

downloadBtn.addEventListener('click', function() {
  var text = resultBox.textContent;
  if (text.trim() !== '') {
    var blob = new Blob([text], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'expense_split_result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});

darkModeToggle.addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
  var pressed = darkModeToggle.getAttribute('aria-pressed') === 'true';
  darkModeToggle.setAttribute('aria-pressed', !pressed);
});

devBtn.addEventListener('click', function() {
  window.open('https://www.siddharthkumar.tech/', '_blank');
});
