'use strict';

const sendForm = function () {
  let form = document.querySelector('form');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();

    let request = new XMLHttpRequest();
    request.open('POST', form.action);

    let data = new FormData(form);

    request.addEventListener('load', (e) => {
      console.log(request.status);
      console.log(request.response);
      alert("Staff member successfully added!");
    });

    request.send(data);
  })
}

document.addEventListener('DOMContentLoaded', sendForm);

