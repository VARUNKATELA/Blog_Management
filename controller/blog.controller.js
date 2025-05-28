import { Op, Sequelize } from 'sequelize';
import { Blog, Document, User, } from '../models/index.js';
import { dataNotFound, parameterNotFound, responseSender, showLog } from '../helper/function.helper.js';
import { StatusCode } from '../server/statusCode.js';
import { RemoveFile, UploadFile } from '../helper/document.helper.js';
import { blogValidator } from '../validations/blog.validation.js';

export class BlogController {

    static createBlog = async (req, res, next) => {
        const { file, body } = await UploadFile(req, 'blog');
        try {
            showLog('Create Blog api called');

            await blogValidator.validate(body, { abortEarly: false });

            const blog = await Blog.create({ ...body, userId: req.userId });

            if (file && file.length > 0) {
                for (const item of file) {
                    await Document.create({
                        type: 'blob',
                        url: item.path,
                        blogId: blog.id,
                        name: item.fieldname
                    });
                }
            }
            showLog('Blog created successfully');

            return responseSender(res, 'Blog Created', StatusCode.CREATED, blog);
        } catch (error) {
            await RemoveFile(file);
            if (error.name === 'ValidationError') {
                return responseSender(res, 'Validation failed', StatusCode.BADREQUEST, error.errors);
            }
            next(error);
        }
    };

    static getBlog = async (req, res, next) => {
        try {
            showLog('Blog list api called');

            const { pageNumber, pageSize, search, userId } = req.query;

            const limit = parseInt(pageSize) || 10;
            const page = parseInt(pageNumber) || 1;
            const offset = (page - 1) * limit;

            const where = {};

            if (userId) {
                where.userId = userId;
            }
            if (search) {
                where[Op.or] = [
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), { [Op.like]: `%${search.toLowerCase()}%` }),
                    Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('content')), { [Op.like]: `%${search.toLowerCase()}%` }),
                ];
            }

            const blog = await Blog.findAndCountAll({
                where: { ...where },
                include: [
                    { model: User, attributes: ['name', 'email'] },
                    { model: Document, attributes: ['type', 'url', 'name'] }
                ],
                limit, offset
            });

            const response = {
                blog: blog.rows,
                pageInfo: {
                    total: blog.count,
                    currentPage: page,
                    totalPages: Math.ceil(blog.count) / limit
                }
            };
            showLog('Blog fetched successfully');

            return responseSender(res, 'Blog fetched', StatusCode.OK, response);
        } catch (error) {
            next(error);
        }
    };

    static getBlogDetail = async (req, res, next) => {
        try {
            showLog('Blog detail api called');

            parameterNotFound(req.query.blogId, 'blogId');

            const blog = await Blog.findByPk(req.query.blogId, {
                include: [
                    { model: User, attributes: ['name', 'email'] },
                    { model: Document, attributes: ['type', 'url', 'name'] }
                ]
            });
            showLog('Blog detail fetched successfully');

            return responseSender(res, 'Blog detail fetched', StatusCode.OK, blog);
        } catch (error) {
            next(error);
        }
    };

    static updateBlog = async (req, res, next) => {
        const { file, body } = await UploadFile(req, 'blog');
        try {
            showLog('Update Blog api called');

            parameterNotFound(req.query.blogId, 'blogId');

            await blogValidator.validate(body, { abortEarly: false });

            const blog = await Blog.findByPk(req.query.blogId);
            dataNotFound(blog, 'Blog', StatusCode.NOT_FOUND, true);

            await blog.update({ ...body });

            if (file && file.length > 0) {
                for (const item of file) {
                    await Document.create({
                        type: 'blob',
                        url: item.path,
                        blogId: blog.id,
                        name: item.fieldname
                    });
                }
            }
            showLog('Blog updated successfully');

            return responseSender(res, 'Blog Created', StatusCode.OK, blog);
        } catch (error) {
            if (error.name === 'ValidationError') {
                return responseSender(res, 'Validation failed', StatusCode.BADREQUEST, error.errors);
            }
            next(error);
        }
    };

    static deleteBlog = async (req, res, next) => {
        try {
            showLog('Delete Blog api called');

            parameterNotFound(req.query.blogId, 'blogId');

            const blog = await Blog.findByPk(req.query.blogId);
            dataNotFound(blog, 'Blog', StatusCode.NOT_FOUND, true);

            const document = await Document.findAll({ where: { blogId: blog.id } });
            const documents = document.map(item => item.url);

            await RemoveFile(documents);
            showLog('Blog deleted successfully');

            return responseSender(res, 'Blog Deleted', StatusCode.OK);
        } catch (error) {
            next(error);
        }
    };

    static deleteDocument = async (req, res, next) => {
        try {
            showLog('Delete Document api called');

            parameterNotFound(req.query.documentId, 'documentId');

            const document = await Document.findByPk(req.query.documentId);
            dataNotFound(document, 'Document', StatusCode.NOT_FOUND, true);

            await RemoveFile(document.url);
            await document.destroy({ force: true });
            showLog('Document deleted successfully');

            return responseSender(res, 'Document Deleted', StatusCode.OK);
        } catch (error) {
            next(error);
        }
    }
};