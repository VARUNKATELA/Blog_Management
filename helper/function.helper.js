export const dataFound = (data, message, statuscode, isCustomize) => {
    if (data) {
        if (isCustomize) {
            message = message + ' already exist';
        }
        const error = new Error(message);
        error.statusCode = statuscode;
        throw error;
    }
};

export const dataNotFound = (data, message, statuscode, isCustomize) => {
    if (!data) {
        if (isCustomize) {
            message = message + ' not found';
        }
        const error = new Error(message);
        error.statusCode = statuscode;
        throw error;
    }
};

export const parameterNotFound = (parameter, key) => {
    if (!parameter) {
        const error = new Error(`Query parameter ${key} is missing`);
        error.statusCode = STATUSCODE.NOT_FOUND;
        throw error;
    }
};

export const responseSender = (res, message, statuscode, data) => {
    return res.status(statuscode).json({
        message,
        statuscode,
        data,
        status: statuscode == 200 || statuscode == 201 ? true : false,
    });
};