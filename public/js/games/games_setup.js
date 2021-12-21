

function setImages() {
    [].forEach.apply(document.getElementsByClassName('game-img'), [img => {
        img.src = '/static/media/banana.svg'
    }])
}

// setImages();