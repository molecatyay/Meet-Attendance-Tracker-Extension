'use strict';
let isValidForm = true;
const nameInput = document.querySelector('#name');
const listInput = document.querySelector('#list');
const seatRangeInput = document.querySelector('#seat-number-to');
const formSelect = document.querySelector('.form__select');
const formStatus = document.querySelector('.form__status');
const sheetBodyOl = document.querySelector('.sheet__body-ol');
const sheetBody = document.querySelector('.sheet__body');
const defaultColors = ['#FBF4B6', '#B6E8F8', '#FFCFCF', '#C5F2C4', '#CFC8E3', '#FED4A2', '#FDD0F3', '#EAEAEA'];
const overlay = document.querySelector('.overlay');
let storageData = {};
let namesInStorage = [];
let modalOpenBefore = false;
let sheetEditMode = false;
let eltStorageData = '';
// chrome.storage.sync.clear();

///-----------------------------------------------------------------------------///
/// On page load setup
///-----------------------------------------------------------------------------///

function resetSheet() {
  // prepopulate fields with previous settings
  console.log('reseting', eltStorageData['color'])
  document.querySelector('#sheet__color').value = eltStorageData['color'];
  if (eltStorageData['filterConfig']) document.querySelector('#sheet__select').value = eltStorageData['filterConfig'];
  if (eltStorageData['seats']) document.querySelector('#sheet__number').value = eltStorageData['seats'];
  // if (eltStorageData['names']) document.querySelector('#sheet__select').value = eltStorageData['names'];

};

function createNameList(list) {
  for (let i = 0; i < list.length; i++) {
    const listItem = document.createElement("li");
    listItem.appendChild(document.createTextNode(list[i]));
    sheetBodyOl.insertAdjacentElement('beforeend', listItem);
  }
}


document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(null, function(items) {
    storageData = items
    namesInStorage = Object.keys(items);
    if (namesInStorage.length === 0) {
      // No lists in storage
      document.querySelector('.startup-section').classList.remove('hidden');
      document.querySelector('.main-section').classList.add('hidden');
      console.log('no items')

    } else {
      // Insert tabs from storage
      for (let [key, value] of Object.entries(items)) {
        const sheetTabItem = document.createElement("div");
        sheetTabItem.classList.add('sheet__tab-item');
        sheetTabItem.style.backgroundColor = value['color'];
        sheetTabItem.appendChild(document.createTextNode(key));
        document.querySelector('.sheet__tabs').insertAdjacentElement('afterbegin', sheetTabItem);
      }
      console.log('got items')
      console.log(items)


      for (const elt of document.querySelectorAll('.sheet__tab-item')) {
        elt.addEventListener('click', function(e){
          eltStorageData = storageData[e.target.textContent];
          // tab and sheet styles
          for (const filteredElt of document.querySelectorAll('.sheet__tab--current')) {
            filteredElt.classList.remove('sheet__tab--current');
          }
          e.target.classList.add('sheet__tab--current');
          document.querySelector('.sheet__startup').classList.add('hidden');
          sheetBody.classList.remove('hidden');
          sheetBody.style.borderColor = eltStorageData['color'];

          // show appropriate configuration fields
          if (eltStorageData['config'] === 'seats') {
            for (const seatElt of document.querySelectorAll('.sheet__config-seat')) {
              seatElt.classList.remove('hidden');
            };
            document.querySelector('.sheet__config-name').classList.add('hidden');

            // prepopulate fields with previous settings
            // document.querySelector('#sheet__select').value = eltStorageData['filterConfig'];
            // document.querySelector('#sheet__number').value = eltStorageData['seats'];

          } else {
            for (const seatElt of document.querySelectorAll('.sheet__config-seat')) {
              seatElt.classList.add('hidden');
            };
            document.querySelector('.sheet__config-name').classList.remove('hidden');
            createNameList(eltStorageData['names']);
            // document.querySelector('#sheet__select').value = eltStorageData['filterConfig'];
          };
          resetSheet();

          


          console.log('hi clicks')
        });
      };

    }
  });
  
});



///-----------------------------------------------------------------------------///
/// Create list Modal
///-----------------------------------------------------------------------------///
function openListModal(){
  modalOpenBefore = true;

  function validateForm() {
    let isSeatConfig = false;
    const errorTextList = document.querySelectorAll('.form__error-text');
    isValidForm = true;
    function sendErrorText(errTextElt, msg){
      errTextElt.innerText = msg;
      errTextElt.previousElementSibling.classList.add('form__error-field');
      isValidForm = false;
    };
    function removeErrorText(errTextElt){
      errTextElt.innerText = '';
      errTextElt.previousElementSibling.classList.remove('form__error-field');
    };

    if (!(nameInput.value)) {
      sendErrorText(errorTextList[0], 'Field required');
    } else if (namesInStorage.includes(nameInput.value)) {
      sendErrorText(errorTextList[0], 'Name used before. Choose another name');
    }else if (nameInput.value.length >= 10) {
      sendErrorText(errorTextList[0], 'Input must be less than 10 characters');
    } else {
      removeErrorText(errorTextList[0]);
    };

    if (isSeatConfig) {
      (!(seatRangeInput.value)) ? sendErrorText(errorTextList[2], 'Field required') : removeErrorText(errorTextList[2]);
    }
    else {
      (!(listInput.value)) ? sendErrorText(errorTextList[1], 'Field required') : removeErrorText(errorTextList[1]);
    };
    return isValidForm;
  };

  // Validate form and store data
  document.querySelector('#submit').addEventListener('click', function() {
    if (validateForm()) {
      const storageDict = {
        [nameInput.value]: {}
      }
      
      if (isSeatConfig) {
        storageDict[nameInput.value]['config'] = 'seats';
        storageDict[nameInput.value]['seats'] = seatRangeInput.value;
        storageDict[nameInput.value]['filterConfig'] = formSelect.value;
      } else {
        storageDict[nameInput.value]['config'] = 'names';
        storageDict[nameInput.value]['names'] = listInput.value.split('\n');
      };
      storageDict[nameInput.value]['color'] = defaultColors[namesInStorage.length];

      chrome.storage.sync.set(storageDict, function() {
        formStatus.textContent = 'Configurations saved'
        setTimeout(function() {window.location.reload();}, 800);
      });

    };
  });

  // Switch element: change form configuration between use seat list and use name list
  document.querySelector('#checkbox').addEventListener('click', function() {
    console.log('check')
    for (const formElt of document.querySelectorAll('.form__config-seat')) {
      formElt.classList.toggle('hidden');
    };
    for (const formElt of document.querySelectorAll('.form__config-name')) {
      formElt.classList.toggle('hidden');
    };
    isSeatConfig = document.querySelector('#checkbox').checked;
  })

  // form select seat number position
  formSelect.addEventListener('change', function() {
    document.querySelector('.form__info-text').innerHTML = (formSelect.value === 'senior') ? 'ie: X<span class="underline">01</span> XXX' : 'ie: J2X <span class="underline">01</span> XXX';
    document.querySelector('.form__info-left').innerText = (formSelect.value === 'senior') ? '2nd-3rd' : '5th-6th';

  });

  // Exit modal by escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      overlay.classList.add('hidden');
    }
  });

}
  // Exit modal by pressing cross
for (const exitModalIcon of document.querySelectorAll('.icon-exit-modal')) {
  exitModalIcon.addEventListener('click', function() {
    overlay.classList.add('hidden');
  });
}


// In startup, show modal
document.querySelector('#startup__setup').addEventListener('click', function() {
  overlay.classList.remove('hidden');
  if (!(modalOpenBefore)) openListModal();
});

// In sheets, show modal
document.querySelector('#sheet__open-modal').addEventListener('click', function(){
  overlay.classList.remove('hidden');
  if (!(modalOpenBefore)) openListModal();
});




///-----------------------------------------------------------------------------///
/// Edit sheet body
///-----------------------------------------------------------------------------///
function toggleSheet() {
  document.querySelector('.sheet__btns').classList.toggle('hidden');
  sheetBody.classList.toggle('sheet__body--edit');
}

function openSheetTextfield() {
  sheetBodyOl.classList.add('hidden');
  document.querySelector('.sheet__textfield').classList.remove('hidden');
}

function closeSheetTextfield() {
  sheetBodyOl.classList.remove('hidden');
  document.querySelector('.sheet__textfield').classList.add('hidden');
}

// Change sheet body ol to textarea
sheetBodyOl.addEventListener('dblclick', function(){
  openSheetTextfield();
  if (!sheetEditMode) {
    toggleSheet();
    sheetEditMode = true;
  };
});

// Listen for change in all sheet fields
for (const elt of document.querySelectorAll('.sheet__body-field')) {
  elt.addEventListener('input', function(e){
    if (!sheetEditMode) {
      toggleSheet();
      sheetEditMode = true;
    };
  });
};

// Bin icon
document.querySelector('.sheet__bin-icon').addEventListener('click', function(){

});

// Cancel button
document.querySelector('.sheet__cancel-btn').addEventListener('click', function(){
  toggleSheet();
  closeSheetTextfield();
  sheetEditMode = false;
  resetSheet();
});

// Save button
document.querySelector('.sheet__save-btn').addEventListener('click', function(){
  toggleSheet();
  for (const elt of document.querySelectorAll('.sheet__body-field')) {
    console.log(elt.value);
  };
});



///-----------------------------------------------------------------------------///
/// 
///-----------------------------------------------------------------------------///






