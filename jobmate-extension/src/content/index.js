// Find all form elements on the page
const formFields = [];

// Function to find and log form fields on the page
function identifyFormFields() {
  // Get all input elements
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    const fieldDetails = {
      type: input.type || input.nodeName.toLowerCase(),
      name: input.name || input.id || 'Unnamed field',
    };
    // (window.getComputedStyle(input).display === "none") || (window.getComputedStyle(input).visibility === "hidden") || 
    if ((input.type != 'hidden')) {
      formFields.push(input);
    }
  });

  // Log all identified fields to the console
  console.log("Identified Form Fields:", formFields);
  
  // Optional: You could also add visual cues to the form fields
  //highlightFields(inputs);
}

// Function to highlight identified form fields on the page
function highlightFields(fields) {
  fields.forEach(field => {
    field.style.border = '1px solid white'; // Example of highlighting
  });
}

function autofillJobApplication() {
  identifyFormFields();

  // Autofill each form field
  for (let i = 0; i < formFields.length; i++) {
    const fieldElement = formFields[i]; 
    if (fieldElement.name || fieldElement.id) {
      if ((fieldElement.name || fieldElement.id).includes("name")) {
        if  ((fieldElement.name || fieldElement.id).includes("first")) {
          fieldElement.value = 'John';
        }
        else if ((fieldElement.name || fieldElement.id).includes("last")) {
          fieldElement.value = 'Doe';
        }
      }
      else if ((fieldElement.name || fieldElement.id).includes("email")) {
        fieldElement.value = 'john.doe@gmail.com';
      }
      else if ((fieldElement.name || fieldElement.id).includes("phone")) {
        fieldElement.value = '555-1234-6987';
      }
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'autofillJobApplication') {
    autofillJobApplication();
  }
});

// window.addEventListener('load', autofillJobApplication);
