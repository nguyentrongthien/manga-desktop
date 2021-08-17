export default {
    handle(error) {
        console.log(error);
        try {
            _handleNoInternetException(error);

            return error.toString();
        } catch (e) { return e.toString();}
    }
}

function _handleNoInternetException(error) {
    if(error.toString().toLowerCase().includes('enotfound') && error.toString().toLowerCase().includes('getaddrinfo'))
        throw 'Could not connect to the internet';
}