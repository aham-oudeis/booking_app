document.addEventListener('DOMContentLoaded', () => {
  //fetch the data about staff memebers
  const staffMembersPromise = (async function getStaffInfo() {
    let init = {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      },
    };

    let staffs = await fetch('/api/staff_members', init);
    let arrayOfStaff = await staffs.json();

    return arrayOfStaff;
  })();

  let form = document.querySelector('form');
  let firstScheduleForm = form.querySelector('.form-container');
  let selection = firstScheduleForm.querySelector('select');
  let submit = firstScheduleForm.parentNode.lastElementChild;
  let addButton = document.querySelector('div button');

  const counter = function() {
    let count = 1;
    return function() {
      count++;
      return count;
    };
  }();

  const addScheduleForm = function addScheduleForm() {
    let formClone = firstScheduleForm.cloneNode(true);
    let scheduleNumber = formClone.querySelector('.schedule-number span');

    scheduleNumber.textContent = String(counter());

    firstScheduleForm.parentNode.insertBefore(formClone, submit);
  };

  // a function that consumes the staffMembersPromise to add to the dom
  function addStaff(staffNamesPromise) {
    const createStaffNamesOptions = (listOfStaffInfo) => {
      listOfStaffInfo.forEach(staff => {
        let option = document.createElement('option');
        option.textContent = staff.name;

        selection.appendChild(option);
       });
    };

    staffNamesPromise.then(createStaffNamesOptions);
  }

  addStaff(staffMembersPromise);

  let convertNamesToId = staffMembersPromise
                            .then(arr => arr.map(staff => [staff.name, staff.id]))
                            .then(staff => Object.fromEntries(staff));

  addButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    addScheduleForm();
  });

  function extractData(div) {
    //this function walks through the div and collects all the labels and 
    //the values stored in the input/select
    let data = {};

    let formGroups = div.querySelectorAll('.form-data');

    for (let i = 0; i < formGroups.length; i++) {
      let currentFormGroup = formGroups[i];
      let input = currentFormGroup.lastElementChild;

      let [key, value] = [input.name, input.value]

      data[key] = value;
    }

    return data;
  }

  async function generateJSON(formCollection) {
    let data = {
      schedules: [],
    };

    let conversion = await Promise.resolve(convertNamesToId);

    for (let i = 0; i < formCollection.length; i++) {
      let formDiv = formCollection[i];

      let currentData = extractData(formDiv);
      let name = currentData['staff_id'];

      currentData['staff_id'] = conversion[name];

      data.schedules.push(currentData);
    }

    console.log(data);

    return JSON.stringify(data);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let allForms = document.querySelectorAll('.form-container');
    let data = generateJSON(allForms);

    let response = data.then(body => {
      let init =  {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: body,
      };

      return fetch('/api/schedules', init);
    })

    response.then(response => response.json()).then(console.log)
})
});
