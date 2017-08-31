'use strict';

const MyForm = new Form('myForm');

function Form( id ) {
  const _this = this;

  this.form = document.getElementById(id);

  this.form.addEventListener('submit', function(e) {
    e.preventDefault();
    _this.submit();
  });
}

Form.prototype.validate = function() {
  let requiredFields = this.form.querySelectorAll('[data-pattern]'),
    data = { isValid: true, errorFields: [] };

  for(let field of requiredFields) {
    const fieldPattern = field.dataset.pattern,
      fieldName = field.getAttribute('name'),
      fieldVal = field.value;

    field.classList.remove('error');

    if(!this.validateByPattern(fieldPattern, fieldVal)) {
      data.errorFields.push(fieldName);
      field.classList.add('error');
    }
  }

  data.isValid = data.errorFields.length === 0;

  return data;
}

Form.prototype.validateByPattern = function( pattern, value ) {
  let isValid = true;

  switch(pattern) {
    case 'fio':
      const fioRegExp = new RegExp('[а-яёa-z]+(?:\\-[а-яёa-z]+)?', 'gi');
      
      isValid = value.match(fioRegExp) !== null && value.match(fioRegExp).length === 3;

      break;

    case 'email':
      const yaEmailRegExp = new RegExp('^[\\w.-]+@(?:ya\\.ru|yandex\\.(?:ru|ua|by|kz|com))$', 'i');
      
      isValid = yaEmailRegExp.test(value);

      break;

    case 'phone':
      let sum = 0;
      const phoneFormatRegExp = new RegExp('^\\+7\\(\\d{3}\\)\\d{3}\\-\\d{2}\\-\\d{2}$'),
        numArray = value.match(/\d/g);

      if(numArray !== null) {
        for (let num of numArray) {
          sum += parseInt(num);
        }

        isValid = phoneFormatRegExp.test(value) && sum <= 30;
      } else {
        isValid = false;
      }

      break;
  }

  return isValid;
}

Form.prototype.getData = function() {
  let data = {};
  const inputFields = this.form.querySelectorAll('input');

  for(let field of inputFields) {
    const fieldName = field.getAttribute('name');

    data[fieldName] = field.value;
  }

  return data;
}

Form.prototype.setData = function( data ) {
  const inputFields = this.form.querySelectorAll('input');

  for(let field of inputFields) {
    const fieldName = field.getAttribute('name');

    if(fieldName in data) {
      field.value = data[fieldName];
    }
  }
}

Form.prototype.submit = function() {
  const data = this.getData(),
    action = this.form.getAttribute('action'),
    validate = this.validate();

  if(validate.isValid) {
    this.ajaxGet(action, data);
  }
}

Form.prototype.ajaxGet = function( url, data ) {
  let response;
  const _this = this,
    xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      _this.responseProcessing(JSON.parse(this.responseText));
    }
  }

  xhr.open("GET", url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(data));
}

Form.prototype.responseProcessing = function( data ) {
  const _this = this,
    submitButton = this.form.querySelector('#submitButton'),
    random = Math.random();

  submitButton.disabled = data.status === 'progress';

  switch(data.status) {
    case 'progress':
      _this.setStatus('progress');

      setTimeout(function() {
        const formData = _this.getData(),
          url = (random > .66)
            ? 'handlers/progress.json'
            : (random > .33)
              ? 'handlers/success.json'
              : 'handlers/error.json';

        _this.ajaxGet(url, formData);
      }, data.timeout);

      break;
    case 'success':
      _this.setStatus('success', 'Success');
      
      break;
    case 'error':
      _this.setStatus('error', data.reason);
      
      break;
  }
}

Form.prototype.setStatus = function( className = '', text = '' ) {
  const resultContainer = this.form.querySelector('#resultContainer');

  resultContainer.classList.remove('progress', 'success', 'error');
  resultContainer.classList.add(className);
  resultContainer.innerText = text;
}