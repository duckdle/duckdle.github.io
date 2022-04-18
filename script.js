const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const ds = document.body.dataset;
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const daysago = Math.floor((Date.now() - new Date('4/17/2022')) / 86400000) + 1;
const words = Object.keys(secret);
const word = words[daysago % words.length];
const ls = localStorage;

var gameboard;

var subtitleText;
var state;
var row;

if (ls.word == word) {
  gameboard = JSON.parse(ls.gameboard || '[["","","","",""],["","","","",""],["","","","",""],["","","","",""],["","","","",""]]');
  subtitleText = ls.subtitleText || '';
  ds.subtitle = subtitleText;
  $('#subtitle').textContent = subtitleText ? ` ${subtitleText}` : '';
  state = ls.state || '';
  ds.state = state;
  if (state) ds.share = true;
  row = Number(ls.row) || 0;
  let trow = 0;
  gameboard.forEach(r => {
    if (r.join('') == word.toUpperCase()) {
      $(`#guess > .row:nth-child(${trow + 1})`)?.classList.add('correct');
    } else if (trow < row) {
      $(`#guess > .row:nth-child(${trow + 1})`)?.classList.add('incorrect');
    }
    let index = 0;
    r.forEach(c => {
      index++;
      setItem(trow + 1, index, c);
    });
    trow++;
  });
} else {
  ls.word = word;
  gameboard = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ];
  subtitleText = '';
  state = '';
  row = 0;
}

if (!ls.visited) {
  ls.visited = true;
  ls.help = true;
}

$('#vkb').oninput = () => $('#vkb').value = '';

$('#title').textContent = `Duckdle #${daysago}`;
$(':root').style.setProperty('--blur', 3 - row);
$(`#guess > .row:nth-child(${row + 1})`)?.classList.add('focused');
$('#image > img').src = secret[word];
ds.help = ls.help;

// safari hack
document.body.onclick = () => {};

$('#image').onclick = () => {
  ls.help = !JSON.parse(ls.help);
  ds.help = ls.help;
};

$('#help').onclick = () => {
  ls.help = false;
  ds.help = ls.help;
};

$('#image > img').oncontextmenu = () => {
  if (!state) {
    subtitle('Hey, that\'s cheating');
    return false;
  }
};

$('#guess').onclick = () => {
  let rect = $(`#guess > .row:nth-child(${row + 1})`).getBoundingClientRect();
  $('#vkb').style.top = `${rect.top + window.scrollY}px`;
  $('#vkb').style.left = `${rect.left + window.scrollX}px`;
  $('#vkb').style.width = `${rect.width}px`;
  $('#vkb').style.height = `${rect.height}px`;
  $('#vkb').focus();
};

$('#subwrap').oncontextmenu = () => {
  if (confirm('Looks like you\'ve found an easter egg\nWould you like to see it?')) {
    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  } else {
    alert('The duck is now sad :(');
    return false;
  }
};

$('#share').onclick = async () => {
  let emojis = `Duckdle #${daysago}\n\n`;
  gameboard.forEach(r => {
    if (r.join('') == word.toUpperCase()) return emojis += '✅';
    if (!r[0]) return emojis += '▫️';
    let num = r.filter(c => word.toUpperCase().split('').includes(c)).length;
    emojis += ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][num];
  });
  emojis += ' 🦆\n\nhttps://duckdle.github.io';
  try {
    await navigator.clipboard.writeText(emojis);
    $('#share').textContent = '✅ copied';
  } catch (error) {
    try {
      navigator.share({ text: emojis });
    } catch (error) {
      alert(emojis);
    }
  }
};

// safari hack
document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});

document.addEventListener('keydown', async (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  var key = e.key.toUpperCase();
  var done = false;
  if (key == 'ESCAPE') {
    ls.help = !JSON.parse(ls.help);
    ds.help = ls.help;
  }
  if (state) {
    if (key == 'ENTER') {
      $('#share').click();
    }
  } else {
    if (letters.includes(key)) {
      gameboard[row].forEach((letter, index) => {
        if (letter.length == 0 && !done) {
          gameboard[row][index] = key;
          ls.gameboard = JSON.stringify(gameboard);
          setItem(row + 1, index + 1, key);
          done = true;
        }
      });
    } else if (key == 'BACKSPACE') {
      gameboard[row].slice().reverse().forEach((letter, rindex) => {
        if (letter.length !== 0 && !done) {
          var index = 4 - rindex;
          gameboard[row][index] = '';
          ls.gameboard = JSON.stringify(gameboard);
          setItem(row + 1, index + 1, '');
          done = true;
        }
      });
    } else if (key == 'ENTER') {
      var guess = gameboard[row].join('').toLowerCase();
      if (guess == word) {
        $('#vkb').blur();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        state = 'won';
        ls.state = 'won';
        ds.state = 'won';
        $('#vkb').style.display = 'none';
        $(':root').style.setProperty('--blur', 0);
        subtitle('Nice!');
        $(`#guess > .row:nth-child(${row + 1})`)?.classList.add('correct');
        await sleep(300);
        ls.share = true;
        ds.share = true;
      } else if (secret[guess] || others.includes(guess)) {
        $('#vkb').blur();
        $('#image').scrollIntoView({ behavior: 'smooth' });
        subtitle();
        $(`#guess > .row:nth-child(${row + 1})`)?.classList.remove('focused');
        $(`#guess > .row:nth-child(${row + 1})`)?.classList.add('incorrect');
        row++;
        ls.row = row;
        $(':root').style.setProperty('--blur', 3 - row);
        if (row == 5) {
          state = 'lost';
          ls.state = 'lost';
          ds.state = 'lost';
          $('#vkb').style.display = 'none';
          subtitle(word.toUpperCase());
          await sleep(300);
          ls.share = true;
          ds.share = true;
        } else {
          $(`#guess > .row:nth-child(${row + 1})`)?.classList.add('focused');
        }
      } else {
        if (guess.length < 5) subtitle('Not enough letters');
        if (guess.length == 5) subtitle('Not in word list');
        $(`#guess > .row:nth-child(${row + 1})`)?.classList.add('invalid');
        await sleep(600);
        $(`#guess > .row:nth-child(${row + 1})`)?.classList.remove('invalid');
      }
    }
  }
});

async function setItem(row, column, content) {
  let item = $(`#guess > .row:nth-child(${row}) > div:nth-child(${column})`);
  item.firstChild.textContent = content;
  if (content) {
    item.classList.add('filled');
    item.classList.add('pop');
    await sleep(100);
    item.classList.remove('pop');
  } else {
    item.classList.remove('filled');
  }
}

async function subtitle(text = '') {
  if (text == subtitleText) return;
  subtitleText = text;
  ls.subtitleText = text;
  ds.subtitle = text;
  $('#subbox').classList.add('hide');
  await sleep(150);
  $('#subtitle').textContent = text ? ` ${text}` : '';
  await sleep(150);
  $('#subbox').classList.remove('hide');
}

async function sleep(time) {
  await new Promise(r => setTimeout(r, time));
}

window.addEventListener('focus', () => ds.appFocused = true);
window.addEventListener('blur', () => ds.appFocused = false);

ds.appFocused = document.hasFocus();