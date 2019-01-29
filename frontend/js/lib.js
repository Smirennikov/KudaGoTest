"use strict";
(function(){
    var xhr = new XMLHttpRequest(),
    dataFile = '/data.json',
    initialScreen = document.querySelector('.initial-screen'),
    data;

    var createSectionEvent = function(){
      // создаем контейнер для событий
      var section = document.createElement('section');
      section.className = 'section kudaGo-section-events container active';
      initialScreen.after(section);
      return section;
    }();

    var createEvent = function(i){
      // создаем событие
      var div = document.createElement('div'),
          title = document.createElement('h3'),
          button = document.createElement('button'),
          description = document.createElement('p'),
          price = document.createElement('p'),
          type = document.createElement('p');
      div.className = 'kudaGo-event flex';
      button.className = 'button kudaGo-event__button-favorite'
      button.innerHTML = 'Добавить в избранное'
      title.innerHTML = data[i].title;
      description.innerHTML = data[i].description;
      price.innerHTML = data[i].price;
      type.innerHTML = data[i].type;
      div.appendChild(title)
      div.appendChild(description)
      div.appendChild(price)
      div.appendChild(type)
      div.appendChild(button)

      createSectionEvent.appendChild(div);
    };

    var filterEvent = function(){
      var formButtons = document.querySelectorAll('.kudaGo-form .button'),
          formButtonsLength = formButtons.length;
      for(let i = 0; i < formButtonsLength; i += 1){
        formButtons[i].addEventListener('click', function(event){
          event.preventDefault();
          if(this.innerHTML === 'Концерты'){
            formButtons[1].classList.remove('active')
            this.classList.toggle('active')
            if(this.getAttribute('class') === 'button active'){
              createSectionEvent.innerHTML = '';
              sortTypeEvents('concert');
            }else{
              createSectionEvent.innerHTML = '';
              goingToMas(createEvent);
            }
          }else if(this.innerHTML === 'Выставки'){
            formButtons[0].classList.remove('active')
            this.classList.toggle('active')

            if(this.getAttribute('class') === 'button active'){
              createSectionEvent.innerHTML = '';
              sortTypeEvents('exhibition');
            }else{
              createSectionEvent.innerHTML = '';
              goingToMas(createEvent);
            }
          }
        })
      }
    }

    var addToFavorite = function(){
      var favoriteButtons = document.querySelectorAll('.kudaGo-event__button-favorite'),
      favoriteButtonsLength = favoriteButtons.length;
      for(var i = 0; i < favoriteButtonsLength; i += 1){
        if(localStorage.getItem(favoriteButtons[i].parentNode.querySelector('h3').innerHTML) === 'favorite'){
          // проверка избранности
          favoriteButtons[i].classList.add('favorite');
          favoriteButtons[i].innerHTML = 'В избранном';


        }else{
          favoriteButtons[i].classList.remove('favorite')
          favoriteButtons[i].innerHTML = 'Добавить в избранное';

        }
        favoriteButtons[i].addEventListener('click', function(){
          var nameEvent = this.parentNode.querySelector('h3').innerHTML;
          this.classList.toggle('favorite')
          if(this.getAttribute('class') === 'button kudaGo-event__button-favorite favorite'){
            this.innerHTML = 'В избранном';
            localStorage.setItem(nameEvent, 'favorite');

          }else {
            this.innerHTML = 'Добавить в избранное';
            localStorage.removeItem(nameEvent, 'favorite');
          }
        })
      }
    }

    var checkedTab = function(){
      var tabs = document.querySelectorAll('.kudaGo-tabs .tab'),
      form = document.querySelector('.kudaGo-form'),
      section = document.querySelector('.section'),
      tabsLength = tabs.length;
      for(let i = 0; i < tabsLength; i += 1){
        tabs[i].addEventListener('click', function(){
          this.classList.toggle('active')
          if(this.innerHTML === 'Избранные события'){
            tabs[0].classList.remove('active');
            tabs[1].classList.add('active');
            form.style.display = 'none';

            section.innerHTML = ''
            // проверяем на наличие в избранном
            for(let i = 0, max = data.length; i < max; i += 1){
              if(localStorage.getItem(data[i].title) === 'favorite'){
                // если избранное - выводим
                sortTitleEvents(data[i].title);
              }
            }
          }else if(this.innerHTML === 'Поиск событий'){
            form.style.display = 'block';
            tabs[1].classList.remove('active');
            tabs[0].classList.add('active');

            section.innerHTML = ''
            goingToMas(createEvent)
          }
        })
      }
    }

    function sortTypeEvents(typeEvent){
      // сортируем по типу события
      for(let dataLength = data.length, i = 0; i < dataLength; i += 1){
        if(data[i].type === typeEvent){
          createEvent(i);
          addToFavorite();
        }
      }
    }

    function sortTitleEvents(titleEvent){
      // сортируем по названию события
      for(let dataLength = data.length, i = 0; i < dataLength; i += 1){
        if(data[i].title === titleEvent){
          createEvent(i);
          addToFavorite();
        }
      }
    }

    function goingToMas(callback){
      // обход массива
      for(let dataLength = data.length, i = 0; i < dataLength; i += 1){
          callback(i);
      }
      addToFavorite();
    }

    xhr.open('GET', dataFile, false);
    xhr.send();
    if(xhr.readyState === 4){
      // если все данные получены успешно
      data = xhr.responseText;
      data = JSON.parse(data);
      goingToMas(createEvent);
      filterEvent();
      checkedTab();
    }

}());
