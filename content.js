'use strict';
console.log('content');
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
  }
);







// console.log('hi!');
// // const fullList = ["Tan Ai Lin", "kitty meow"];
// // chrome.storage.sync.set({fullList: fullList});

// // chrome.storage.sync.clear()
// chrome.storage.sync.get(["fullList"], function(result) {
//   const fullList = result["fullList"];
// });



// //https://meet.google.com/*

// let attendeeList = [];

// for (const elt of document.querySelectorAll(".ZjFb7c")) {
//   attendeeList.push(elt.innerText)
// }