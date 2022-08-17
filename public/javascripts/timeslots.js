'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const init = { method: 'GET', 
                 headers: {'Accept': 'application/json'},
               };

  const schedules = fetch('/api/schedules', init)
                    .then(response => response.json());

  const staffMembers = fetch('api/staff_members', init)
                       .then(response => response.json());

  const idToNames = staffMembers
                    .then(list => list.map(staff => [staff.id, staff.name]))
                    .then(Object.fromEntries);

  let firstForm = document.querySelector('form');

  async function insertSchedules() {
    let select = firstForm.querySelector('select');
    let listOfSchedules = await schedules;
    let staffs = await staffMembers;
    let convertIdToNames = await idToNames;
    let infoToPick = ['staff_id', 'date', 'time'];

    listOfSchedules.forEach(schedule => {
      let option = document.createElement('option');
      option.className = 'optionId ' + schedule.id;

      let listOfInfo = infoToPick.map(prop => {
        if (prop === 'staff_id') return convertIdToNames[schedule['staff_id']];
        return schedule[prop];
      });

      option.textContent = listOfInfo.join(' | ');

      select.appendChild(option);
    })
  }

  insertSchedules();

  firstForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let selection = document.querySelector('select');
    let selectedOption = selection.children[selection.selectedIndex];
    
    //bc the schedule id was added as a classname to the option
    let scheduleId = Number(selectedOption.className.split(' ')[1]);
    let email = selection.nextElementSibling.nextElementSibling.value.trim();

    let data = {
      id: scheduleId,
      student_email: email,
    };

    let body = JSON.stringify(data);

    let init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
      body: body,
      };

    let request = fetch('/api/bookings', init).then(response => {
      if (response.ok) return 'success!';
      return response.json();
    });

    request
      .then(response => alert(response))
      .catch(err => {
        alert('You need to first register as a student!');

        let hiddenDiv = document.querySelector('div.hidden');
        hiddenDiv.classList.toggle('hidden');
        
        let secondForm = hiddenDiv.querySelector('form');
        let inputs = secondForm.querySelectorAll('input');
       //bc the booking sequence is the second last element in the list
        let bookingSequence = inputs[inputs.length - 2];
        let emailInput = inputs[0];
        emailInput.value = email;
        bookingSequence.value = err;
     })
  });
});
