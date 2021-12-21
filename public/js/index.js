function hello() {
    console.log('Hello');
}

hello();

const parseResponse = res => {
    return res.headers.get('content-type').includes('application/json') ?
        res.json() :
        res.text();
}

/**
 * @param {SubmitEvent} event 
 */
function onSubmitSignin(event) {
    console.log('onSubmitSignin')

    event.preventDefault();
    
    const data = Array.from(event.target.querySelectorAll('*[name]'))
        .reduce((acc, currEl) => {
            if (currEl instanceof HTMLInputElement) {
                acc[currEl.name] = currEl.value;
            }
            return acc;
        }, {});
    
    const body = JSON.stringify(data);
    console.log(body);
    
    fetch('/api/auth/signin', {   // cookies form client:   https://www.codegrepper.com/code-examples/javascript/ejs+get+coockies
        method: 'POST',
        body,
        fetched: true,
        headers: {
            'fetch-redirect': true,
            'content-type': 'application/json',
            'content-length': body.length
        }
    })
    .then(parseResponse) //.then(res => res.json())
    .catch(err => console.error('Response format is not JSON', err.stack))
    .then(res => {
        if(res.redirectURL) {
            console.log(res.redirectURL);
            return void window.location.replace('/');
            // return void (window.location.href = res.redirectURL);
        }
        console.log('Submit res:', res);
    })
}

/**
 * @param {SubmitEvent} event 
 */
 function onSubmitSignup(event) {
    console.log('onSubmitSignup')

    event.preventDefault();
    
    const data = Array.from(event.target.querySelectorAll('*[name]'))
        .reduce((acc, currEl) => {
            if (currEl instanceof HTMLInputElement) {
                acc[currEl.name] = currEl.value;
            }
            return acc;
        }, {});
    
    const body = JSON.stringify(data);
    console.log(body);
    
    fetch('/api/auth/signup', {   // cookies form client:   https://www.codegrepper.com/code-examples/javascript/ejs+get+coockies
        method: 'POST',
        body,
        headers: {
            'content-type': 'application/json',
            'content-length': body.length
        }
    })  
    .then(parseResponse) //.then(res => res.json())
    .catch(err => console.error('Response format is not JSON', err.stack))
    .then(res => {
        if(res && res.redirectURL) {
            console.log(res.redirectURL)
            return void (window.location.href = res.redirectURL);
        }
        console.log(res);
    })
}

function onSubmitSignout(event) {
    console.log('onSubmitSignout');

    event.preventDefault();
    
    fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(parseResponse) //.then(res => res.json())
    .catch(err => console.error('Response format is not JSON', err.stack))
    .then(res => {
        if(res.redirectURL) {
            console.log(res.redirectURL)
            return void (window.location.href = res.redirectURL);
        }
        console.log(res);
    })
}

const signin_form = document.getElementById('signin_form');
if(signin_form) signin_form.addEventListener('submit', onSubmitSignin);

const signup_form = document.getElementById('signup_form');
if(signup_form) signup_form.addEventListener('submit', onSubmitSignup);

const signout_button = document.getElementById('signout_button');
if(signout_button) signout_button.addEventListener('click', onSubmitSignout);