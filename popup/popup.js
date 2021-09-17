'use strict';
console.log('popup.js');
function toggleEditMode() {
  function toggleHidden(eltList){
    for (const elt of eltList) {
      elt.classList.toggle('hidden');
    };
  }
  toggleHidden(document.querySelectorAll('.btn'));
  toggleHidden(document.querySelectorAll('.table__head-icon'));
  toggleHidden(document.querySelectorAll('.bin-icon'));
};

document.querySelector('#edit-icon').addEventListener('click', toggleEditMode);
document.querySelector('#cross-icon').addEventListener('click', toggleEditMode);
document.querySelector('#cancel-btn').addEventListener('click', toggleEditMode);

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"});
  console.log('sent msg')
});