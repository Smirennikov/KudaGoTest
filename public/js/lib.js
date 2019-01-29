"use strict";

(function () {
  var xhr = new XMLHttpRequest(),
      dataFile = '/data.json',
      initialScreen = document.querySelector('.initial-screen'),
      data;

  var createSectionEvent = function () {
    // создаем контейнер для событий
    var section = document.createElement('section');
    section.className = 'section kudaGo-section-events container flex';
    initialScreen.after(section);
    return section;
  }();

  var createEvent = function createEvent(i) {
    // создаем событие
    var div = document.createElement('div'),
        title = document.createElement('h3'),
        button = document.createElement('button'),
        description = document.createElement('p'),
        price = document.createElement('p'),
        type = document.createElement('p');
    div.className = 'kudaGo-event flex';
    price.className = 'price';
    button.className = 'button kudaGo-event__button-favorite';
    button.innerHTML = 'Добавить в избранное';
    title.innerHTML = data[i].title;
    description.innerHTML = data[i].description;
    price.innerHTML = data[i].price;
    type.innerHTML = data[i].type;
    div.appendChild(title);
    div.appendChild(description);
    div.appendChild(price);
    div.appendChild(type);
    div.appendChild(button);
    createSectionEvent.appendChild(div);
  };

  var filterEvent = function filterEvent() {
    var formButtons = document.querySelectorAll('.kudaGo-form .button'),
        formButtonsLength = formButtons.length;

    for (var i = 0; i < formButtonsLength; i += 1) {
      formButtons[i].addEventListener('click', function (event) {
        event.preventDefault();

        if (this.innerHTML === 'Концерты') {
          formButtons[1].classList.remove('active');
          formButtons[2].classList.remove('active');
          formButtons[3].classList.remove('active');
          this.classList.toggle('active');

          if (this.getAttribute('class') === 'button active') {
            createSectionEvent.innerHTML = '';
            sortTypeEvents('concert');
          } else {
            createSectionEvent.innerHTML = '';
            goingToMas(createEvent);
          }
        } else if (this.innerHTML === 'Выставки') {
          formButtons[0].classList.remove('active');
          formButtons[2].classList.remove('active');
          formButtons[3].classList.remove('active');
          this.classList.toggle('active');

          if (this.getAttribute('class') === 'button active') {
            createSectionEvent.innerHTML = '';
            sortTypeEvents('exhibition');
          } else {
            createSectionEvent.innerHTML = '';
            goingToMas(createEvent);
          }
        }
      });
    }
  };

  var sortingEvent = function sortingEvent() {
    var formButtons = document.querySelectorAll('.kudaGo-form .button'),
        formButtonsLength = formButtons.length;

    for (var i = 2; i < formButtonsLength; i += 1) {
      formButtons[i].addEventListener('click', function (event) {
        event.preventDefault();
        this.classList.add('active');

        if (this.innerHTML === 'По возрастанию') {
          if (this.getAttribute('class') === 'button active') {
            formButtons[3].classList.remove('active');
            sortCoast('up');
          } else {
            createSectionEvent.innerHTML = '';
            goingToMas(createEvent);
          }
        } else if (this.innerHTML === 'По убыванию') {
          if (this.getAttribute('class') === 'button active') {
            formButtons[2].classList.remove('active');
            sortCoast('down');
          } else {
            createSectionEvent.innerHTML = '';
            goingToMas(createEvent);
          }
        }
      });
    }
  };

  var addToFavorite = function addToFavorite() {
    var favoriteButtons = document.querySelectorAll('.kudaGo-event__button-favorite'),
        favoriteButtonsLength = favoriteButtons.length;

    for (var i = 0; i < favoriteButtonsLength; i += 1) {
      if (localStorage.getItem(favoriteButtons[i].parentNode.querySelector('h3').innerHTML) === 'favorite') {
        // проверка избранности
        favoriteButtons[i].classList.add('favorite');
        favoriteButtons[i].innerHTML = 'В избранном';
      } else {
        favoriteButtons[i].classList.remove('favorite');
        favoriteButtons[i].innerHTML = 'Добавить в избранное';
      }

      favoriteButtons[i].addEventListener('click', function () {
        var nameEvent = this.parentNode.querySelector('h3').innerHTML;
        this.classList.toggle('favorite');

        if (this.getAttribute('class') === 'button kudaGo-event__button-favorite favorite') {
          this.innerHTML = 'В избранном';
          localStorage.setItem(nameEvent, 'favorite');
        } else {
          this.innerHTML = 'Добавить в избранное';
          localStorage.removeItem(nameEvent, 'favorite');
        }
      });
    }
  };

  var checkedTab = function checkedTab() {
    var tabs = document.querySelectorAll('.kudaGo-tabs .tab'),
        form = document.querySelector('.kudaGo-form'),
        section = document.querySelector('.section'),
        tabsLength = tabs.length;

    for (var i = 0; i < tabsLength; i += 1) {
      tabs[i].addEventListener('click', function () {
        this.classList.toggle('active');

        if (this.innerHTML === 'Избранные события') {
          tabs[0].classList.remove('active');
          tabs[1].classList.add('active');
          form.style.display = 'none';
          section.innerHTML = ''; // проверяем на наличие в избранном

          for (var _i = 0, max = data.length; _i < max; _i += 1) {
            if (localStorage.getItem(data[_i].title) === 'favorite') {
              // если избранное - выводим
              sortTitleEvents(data[_i].title);
            }
          }
        } else if (this.innerHTML === 'Поиск событий') {
          form.style.display = 'block';
          tabs[1].classList.remove('active');
          tabs[0].classList.add('active');
          section.innerHTML = '';
          goingToMas(createEvent);
        }
      });
    }
  };

  var masCoastSorted = function masCoastSorted() {
    // сортируем по цене и ее возрастанию
    var masCoast = [];

    for (var dataLength = data.length, i = 0; i < dataLength; i += 1) {
      masCoast.push(data[i].price);
    }

    masCoast.sort(function (a, b) {
      return a - b;
    });
    return masCoast;
  };

  var searching = function () {
    var searchInput = document.querySelector('.kudaGo-form input'),
        section = document.querySelector('.section');
    searchInput.addEventListener('keyup', function () {
      if (searchInput.value === '') {
        section.innerHTML = '';
        goingToMas(createEvent);
      } else {
        section.innerHTML = '';
        var regExp = new RegExp(searchInput.value, 'i');
        searchEvents(regExp);
      }

      console.log(searchInput.value);
    });
  }();

  function sortCoast(sort) {
    // выводим по сортировке цены
    var allEvents = document.querySelectorAll('.kudaGo-section-events .kudaGo-event'),
        allEventsLength = allEvents.length,
        masIndex = function masIndex(i) {
      // находим индекс массива в зависимости от цены события
      return masCoastSorted().indexOf(parseInt(allEvents[i].querySelector('.price').innerHTML));
    },
        masIndexReverse = function masIndexReverse(i) {
      // реверсируем
      // находим индекс массива в зависимости от цены события
      return masCoastSorted().reverse().indexOf(parseInt(allEvents[i].querySelector('.price').innerHTML));
    };

    if (sort === 'up') {
      for (var i = 0; i < allEventsLength; i += 1) {
        allEvents[i].style.order = masIndex(i);
      }
    } else if (sort === 'down') {
      for (var i = 0; i < allEventsLength; i += 1) {
        allEvents[i].style.order = masIndexReverse(i);
      }
    }
  }

  function sortTypeEvents(typeEvent) {
    // сортируем по типу события
    for (var dataLength = data.length, i = 0; i < dataLength; i += 1) {
      if (data[i].type === typeEvent) {
        createEvent(i);
        addToFavorite();
      }
    }
  }

  function searchEvents(title) {
    // сортируем по типу события
    for (var dataLength = data.length, i = 0; i < dataLength; i += 1) {
      if (title.test(data[i].title) || title.test(data[i].description)) {
        createEvent(i);
        addToFavorite();
      }
    }
  }

  function sortTitleEvents(titleEvent) {
    // сортируем по названию события
    for (var dataLength = data.length, i = 0; i < dataLength; i += 1) {
      if (data[i].title === titleEvent) {
        createEvent(i);
        addToFavorite();
      }
    }
  }

  function goingToMas(callback) {
    // обход массива
    for (var dataLength = data.length, i = 0; i < dataLength; i += 1) {
      callback(i);
    }

    addToFavorite();
  }

  xhr.open('GET', dataFile, false);
  xhr.send();

  if (xhr.readyState === 4) {
    // если все данные получены успешно
    data = xhr.responseText;
    data = JSON.parse(data);
    goingToMas(createEvent);
    filterEvent();
    checkedTab();
    sortingEvent();
  }
})();