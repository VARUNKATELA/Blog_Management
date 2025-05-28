import fs from 'fs';
import multer from "multer";

const { BASE_PATH } = process.env;

export const UploadFile = async (req, folder = '/') => {

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const path = `uploads/${folder}`;
            fs.mkdirSync(path, { recursive: true })
            cb(null, path);
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''));
        },
    });

    const upload = multer({ storage: storage }).any();

    return new Promise((resolve, reject) => {
        upload(req, null, async (err) => {
            if (err) return reject(err);

            try {
                if (req.files) {
                    const files = await Promise.all(req.files.map(async (file) => {
                        let filePath = file.path.replace(/\\/g, '/');
                        return { ...file, path: BASE_PATH + filePath };
                    }));

                    resolve({
                        body: req.body,
                        file: files,
                    });
                } else {
                    return reject(new Error('No files found.'));
                }
            } catch (error) {
                reject(error);
            }
        });
    });

};

export const RemoveFile = async (files) => {
    try {
        if (!files) {
            throw new Error("No files provided for deletion.");
        }
        if (Array.isArray(files)) {
            files.forEach((file) => {
                const path = file.path ? file.path.replace(BASE_PATH, "") : file.replace(BASE_PATH, "");
                fs.unlinkSync(path);
                console.log("Files Deleted");
            });
        } else {
            const path = files.path ? files.path.replace(BASE_PATH, "") : files.replace(BASE_PATH, "");
            fs.unlinkSync(path);
            console.log("File Deleted");
        }
    } catch (error) {
        console.error(error.message);
    }
};