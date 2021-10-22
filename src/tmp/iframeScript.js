document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', (event) => {
        let target = event.target.tagName === 'A' ? event.target : event.target.closest('a');
        if (target) {
            event.preventDefault();
            let href = target.getAttribute('href');
            console.log('captured ' + href);
            window.parent.postMessage(href, '*');
        }
    })
});