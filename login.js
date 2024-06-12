function getValues() {
    const username_email = document.querySelector(".user_email").value;
    const password = document.querySelector(".Password_field").value;

    return [username_email, password];
}

async function login() {
    const msg = new MessageComponent();

    // Get the values from the input fields
    const username_email = getValues()[0];
    const password = getValues()[1];

    // send the request to the server for further check, under /log-user
    // Try - catch block

    try {



        const response = await fetch("/login-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username_email: username_email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        msg.showMessage("Login processed... ✅", "success");
        const data = await response.json();
        window.location.href = data.redirect;

        console.log(data);
    } catch (error) {
        msg.showMessage('error when logging in. try again. ❌', 'error')
        console.log(error);
    }
    
}

document.addEventListener('DOMContentLoaded', async function () {
    document.querySelector('#loginBtn').addEventListener('click', function (e) {
        e.preventDefault();
        login();
    });
});