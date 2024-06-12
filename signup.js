function getValues() {
  const email = document.querySelector('.Email_field').value;
  const username = document.querySelector('.Username_field').value;
  const password = document.querySelector('.Password_field').value;
  return [email, username, password];
}

async function signUp() {

  const msg = new MessageComponent();

  const email = getValues()[0];
  const username = getValues()[1];
  const password = getValues()[2];

  const profileCode = document.querySelector('.profile-pic.selected').dataset.code;
  console.log("profile code: " + profileCode);

  if (!validate()) {
      alert('Please enter valid data.');
      return;
  }
  try {
      // Fetch a post request to create a new account
      const response = await fetch('/create-user', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              email: email,
              username: username,
              password: password,
              profileCode: profileCode
          })
      });
      if (!response.ok) {
          msg.showMessage('Something went wrong. Please try again later. ❌', "error");
          return;
      }
      const data = await response.json();

      msg.showMessage('Processing request... ✅', "success");

      // Redirect to page
      window.location.href = data.redirect
  } catch (error) {
      // handle error message
      msg.showMessage('Something went wrong. Please try again later. ❌', "error");
      console.log(error);
  }
}

function validate() {
  const msg = new MessageComponent();

  const email = getValues()[0];
  const username = getValues()[1];
  const password = getValues()[2];
  // Validate email and username
  if (email.trim() === '' || username.trim() === '' || password.trim() === '') {
      msg.showMessage('Please fill in all the fields', 'warning');
      return false;
  }
  // Validate password
  if (!validatePassword(password)) {
      msg.showMessage('Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character', 'warning');
      return false;
  }
  return true;
}

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

document.addEventListener('DOMContentLoaded', async function () {
  document.querySelector('#signupBtn').addEventListener('click', function (e) {
      e.preventDefault();
      signUp();
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const profilePics = document.querySelectorAll('.profile-pic');
  
  // Set default selected profile picture (e.g., the first one)
  profilePics[0].classList.add('ring-4', 'ring-blue-500', 'selected');

  profilePics.forEach(pic => {
      pic.addEventListener('click', () => {
          // Remove selected class from all images
          profilePics.forEach(p => p.classList.remove('ring-4', 'ring-blue-500', 'selected'));
          
          // Add selected class to the clicked image
          pic.classList.add('ring-4', 'ring-blue-500', 'selected');
      });
  });
});