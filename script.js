document.addEventListener('DOMContentLoaded', () => {
  FastClick.attach(document.body);
}, false)


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

var quackInt;

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
      $cl(`#guess > .row:nth-child(${trow + 1})`, 'add', 'correct');
    } else if (trow < row) {
      $cl(`#guess > .row:nth-child(${trow + 1})`, 'add', 'incorrect');
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
  ls.gameboard = JSON.stringify(gameboard);
  subtitleText = '';
  ls.subtitleText = subtitleText;
  ds.subtitleText = subtitleText
  state = '';
  ls.state = state;
  ds.state = state;
  row = 0;
  ls.row = row
}

if (!ls.visited) {
  ls.visited = true;
  ls.help = true;
}

$('#vkb').oninput = () => $('#vkb').value = '';

$('#title').textContent = `Duckdle #${daysago}`;
$(':root').style.setProperty('--blur', state ? 0 : 3 - row);
$cl(`#guess > .row:nth-child(${row + 1})`, 'add', 'focused');
$('#image > img').src = secret[word];
ds.help = ls.help;

// safari hack
document.body.onclick = () => {};

$('#image').onclick = () => {
  ls.help = true;
  ds.help = ls.help;
};

$('#help').onclick = (e) => {
  if (e.target == $('#pipipear')) return;
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
  if (state) return;
  if (JSON.parse(ls.help)) return;
  let tl = $(`#guess > .row:nth-child(${row + 1}) > div:first-child`).getBoundingClientRect();
  let br = $(`#guess > .row:nth-child(${row + 1}) > div:last-child`).getBoundingClientRect();
  $('#vkb').style.top = `${tl.top + window.scrollY}px`;
  $('#vkb').style.left = `${tl.left + window.scrollX}px`;
  $('#vkb').style.width = `${br.right - tl.left}px`;
  $('#vkb').style.height = `${tl.height}px`;
  $('#vkb').focus();
};

$('#subbox').onclick = async () => {
  if (JSON.parse(ls.help)) return;
  clearTimeout(quackInt);
  if ($('#subtitle').textContent != ' *quack*') {
    $('#subwrap').classList.add('hide');
    await sleep(150);
    $('#subtitle').textContent = ' *quack*';
    await sleep(150);
    $('#subwrap').classList.remove('hide');
  }
  quackInt = setTimeout(async () => {
    $('#subwrap').classList.add('hide');
    await sleep(150);
    $('#subtitle').textContent = ` ${subtitleText}`;
    await sleep(150);
    $('#subwrap').classList.remove('hide');
  }, 2000);
};

$('#subbox').oncontextmenu = () => {
  if (JSON.parse(ls.help)) return;
  if (confirm('Looks like you\'ve found an easter egg\nWould you like to see it?')) {
    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  } else {
    alert('The duck is now sad :(');
    return false;
  }
};

$('#share').onclick = async () => {
  if (JSON.parse(ls.help)) return;
  let emojis = `Duckdle #${daysago}\n\n`;
  gameboard.forEach(r => {
    if (r.join('') == word.toUpperCase()) return emojis += '???';
    if (!r[0]) return emojis += '??????';
    let num = r.filter(c => word.toUpperCase().split('').includes(c)).length;
    emojis += ['0??????', '1??????', '2??????', '3??????', '4??????', '5??????'][num];
  });
  emojis += ' ????\n\nhttps://duckdle.github.io';
  try {
    await navigator.clipboard.writeText(emojis);
    $('#share').textContent = '??? copied';
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
  if (e.ctrlKey || e.metaKey || e.key == "Meta" || e.altKey) return;
  var key = e.key.toUpperCase();
  var done = false;
  if (key == 'ESCAPE') {
    ls.help = !JSON.parse(ls.help);
    ds.help = ls.help;
  } else if (state) {
    if (key == 'ENTER') {
      $('#share').click();
    }
  } else {
    if (JSON.parse(ls.help)) {
      if (e.shiftKey) return;
      $cl('#help', 'add', 'invalid');
      await sleep(600);
      $cl('#help', 'remove', 'invalid');
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
          $cl(`#guess > .row:nth-child(${row + 1})`, 'add', 'correct');
          await sleep(300);
          ls.share = true;
          ds.share = true;
        } else if (secret[guess] || others.includes(guess)) {
          $('#vkb').blur();
          $('#image').scrollIntoView({ behavior: 'smooth' });
          subtitle();
          $cl(`#guess > .row:nth-child(${row + 1})`, 'remove', 'focused');
          $cl(`#guess > .row:nth-child(${row + 1})`, 'add', 'incorrect');
          row++;
          ls.row = row;
          $(':root').style.setProperty('--blur', 3 - row);
          if (row == 5) {
            state = 'lost';
            ls.state = 'lost';
            ds.state = 'lost';
            $('#vkb').style.display = 'none';
            subtitle(`The word was ${word.toUpperCase()}`);
            await sleep(150);
            ls.share = true;
            ds.share = true;
          } else {
            $cl(`#guess > .row:nth-child(${row + 1})`, 'add', 'focused');
          }
        } else {
          if (guess.length < 5) subtitle('Not enough letters');
          if (guess.length == 5) subtitle('Not in word list');
          $cl(`#guess > .row:nth-child(${row + 1})`, 'add', 'invalid');
          await sleep(600);
          $cl(`#guess > .row:nth-child(${row + 1})`, 'remove', 'invalid');
        }
      }
    }
  }
});

function $cl(selector, addremove = 'add', targetclass) {
  let element = $(selector);
  if (!element) return;
  switch (addremove) {
    case 'add':    element.classList.   add(targetclass); break;
    case 'remove': element.classList.remove(targetclass); break;
  }
}

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
  $('#subwrap').classList.add('hide');
  await sleep(150);
  $('#subtitle').textContent = text ? ` ${text}` : '';
  await sleep(150);
  $('#subwrap').classList.remove('hide');
}

async function sleep(time) {
  await new Promise(r => setTimeout(r, time));
}

window.addEventListener('focus', () => ds.appFocused = true);
window.addEventListener('blur', () => ds.appFocused = false);

ds.appFocused = document.hasFocus();





!function(){const e=document.createElement("meta");e.name="darkreader",e.content="NO-DARKREADER-PLUGIN";const t=function(){!function(){document.querySelector('meta[content="'+e.content+'"]')||document.head.appendChild(e);let t=document.querySelector('meta[name="'+e.name+'"]');t&&t.content!=e.content&&t.remove()}(),function(){for(const e of document.head.getElementsByClassName("darkreader"))e.remove()}()},n={attributes:!1,childList:!0,subtree:!1},o=new MutationObserver(t);!document.querySelector('meta[content="'+e.content+'"]')&&document.querySelector('meta[name="'+e.name+'"]')?console.error("Please add the line bellow to your index.html:\n",'<meta name="darkreader" content="NO-DARKREADER-PLUGIN">\n',"or you may encounter a performance issue!\n","\nplease take a look at: https://github.com/hadialqattan/no-darkreader#usage"):(o.observe(document.head,n),t())}();
