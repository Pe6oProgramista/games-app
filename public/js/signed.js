const parseResponse = res => {
    return res.headers.get('content-type').includes('application/json') ?
        res.json() :
        res.text();
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

const signout_button = document.getElementById('signout_button');
if(signout_button) signout_button.addEventListener('click', onSubmitSignout);