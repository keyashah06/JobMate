// Find all form elements on the page
const formFields = [];
var userResumeDetails = null;
const resumeFields = [/first/, /last/, /name/, /email/, /phone/, /experience/, /education/, /skills/, /company/];

function awaitResumeDetails() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sendResumeDetails') {
      //alert("Received resume details from react script" + message.payload);
      userResumeDetails = message.payload;
    }
    //return true;
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'autofillJobApplication') {
    autofillJobApplication();
  }
});

// Function to find and log form fields on the page
function identifyFormFields() {
  // Get all input elements
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    const fieldDetails = {
      type: input.type || input.nodeName.toLowerCase(),
      name: input.name || input.id || 'Unnamed field',
    };
    if ((input.type != 'hidden')) {
      formFields.push(input);
    }
  });

  console.log("Identified Form Fields:", formFields);
  highlightFields(inputs);
}

// Function to highlight identified form fields on the page
function highlightFields(fields) {
  fields.forEach(field => {
    field.style.border = '1px solid white'; // Example of highlighting
  });
} 

function handlePhoneField(phone) {
  const userPhone = phone.replace(/\D/g, '');
  if (userPhone.length === 10) {
    return userPhone; 
  } 
}

async function autofillJobApplication() {
  var countNames = 0;
  //await awaitResumeDetails();
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sendResumeDetails') {
      //alert("Received resume details from react script" + message.payload);
      userResumeDetails = message.payload;
    }
    //return true;
  });
  // Check if userResumeDetails is null or undefined
  if (!userResumeDetails) {
    var i = 0;
    while (i < 5 && !userResumeDetails) {
      console.log("Waiting for user resume details...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
      i++;
    }
  }
  // Check if userResumeDetails is still null or undefined after waiting

  identifyFormFields();
  console.log("User Resume Details (from content script):", userResumeDetails);
  console.log(userResumeDetails.name.split(" ")[0]);
  console.log(userResumeDetails.name.split(" ")[1]);
  console.log(userResumeDetails.email);
  console.log(userResumeDetails.phone);
  // Autofill each form field
  for (let i = 0; i < formFields.length; i++) {
    const fieldElement = formFields[i];
    var fieldAttributes = fieldElement.attributes;
    for (let attr of fieldAttributes) {
      console.log(`Attribute Name: ${attr.name}, Value: ${attr.value}`);
      if (/first/.test(attr.value.toLowerCase())) { 
        fieldElement.value = userResumeDetails.name.split(" ")[0];
      }
      else if (/last/.test(attr.value.toLowerCase())) { 
        fieldElement.value = userResumeDetails.name.split(" ")[1];
      }
      else if (/email/.test(attr.value.toLowerCase())) {
        fieldElement.value = userResumeDetails.email;
      }
      else if (/phone/.test(attr.value.toLowerCase())) {
        fieldElement.value = handlePhoneField(userResumeDetails.phone);
      }
      //else if () {}
      /* skills, education, address, educational institution, degree, 
      references with contact information, citizenship, military service */
    }
  }
}