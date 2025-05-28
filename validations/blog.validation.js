import yup from 'yup';

export const blogValidator = yup.object().shape({
    title: yup
        .string()
        .required('Title is required'),

    content: yup
        .string()
        .required('Content is required'),
});