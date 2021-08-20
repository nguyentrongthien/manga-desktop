const expObject = {
    handle(error) {
        try {
            for(const handler in handlers)
                handlers[handler](error);

            console.log(error);
            return error.toString();
        } catch (e) { return e.toString();}
    },
    codes: {
        FileNotFoundException: 'ERROR:100:FileNotFoundException',
        NoInternetException: 'ERROR:200:NoInternetException',
    }
}

const handlers = {
    _handleNoInternetException(error) {
        if(error.toString().toLowerCase().includes('enotfound') && error.toString().toLowerCase().includes('getaddrinfo'))
            throw `Could not connect to the internet (${expObject.codes.NoInternetException})`;
    },
    _handleFileNotFoundException(error) {
        if(error.toString().toLowerCase().includes('enoent') && error.toString().toLowerCase().includes('no such file or directory'))
            throw `No such file (${expObject.codes.FileNotFoundException})`;
    }
}

export default expObject;
export const codes = expObject.codes;