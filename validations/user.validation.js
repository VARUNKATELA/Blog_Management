import yup from 'yup';

export const userSignupValidator = yup.object().shape({
    email: yup
        .string()
        .email('Invalid email format')
        .required('Email is required'),

    phone: yup
        .string()
        .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
        .required('Phone number is required'),

    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),

    deviceId: yup
        .string()
        .required('Device Id is required'),
});

export const userLoginValidator = yup.object().shape({
    email: yup
        .string()
        .email('Invalid email format')
        .required('Email is required'),

    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),

    deviceId: yup
        .string()
        .required('Device Id is required'),
})
